import { supabase } from '../lib/supabase';
import { 
  Message, 
  MessageAttachment, 
  Conversation, 
  Notification 
} from '../types/communication';

/**
 * Service for handling communication functionality
 */
export class CommunicationService {
  /**
   * Get conversations for the current user
   * @returns List of conversations
   */
  async getConversations(): Promise<Conversation[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_profiles:participants!conversations_participants_fkey(
            id, full_name, avatar_url
          ),
          messages:messages(
            id, sender_id, content, created_at, is_read
          )
        `)
        .contains('participants', [user.id])
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }

      // Calculate unread count for each conversation
      const conversationsWithUnreadCount = data.map(conversation => {
        const unreadCount = conversation.messages
          ? conversation.messages.filter(
              (message: Message) => !message.is_read && message.sender_id !== user.id
            ).length
          : 0;
        
        return {
          ...conversation,
          unread_count: unreadCount
        };
      });

      return conversationsWithUnreadCount as Conversation[];
    } catch (error) {
      console.error('Error in getConversations:', error);
      return [];
    }
  }

  /**
   * Get a conversation by ID
   * @param conversationId - The ID of the conversation to retrieve
   * @returns The conversation data
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_profiles:participants!conversations_participants_fkey(
            id, full_name, avatar_url
          )
        `)
        .eq('id', conversationId)
        .contains('participants', [user.id])
        .single();

      if (error) {
        console.error('Error fetching conversation:', error);
        return null;
      }

      return data as Conversation;
    } catch (error) {
      console.error('Error in getConversation:', error);
      return null;
    }
  }

  /**
   * Create a new conversation
   * @param participants - Array of participant user IDs
   * @param title - Optional conversation title
   * @returns The created conversation
   */
  async createConversation(
    participants: string[],
    title?: string
  ): Promise<Conversation | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Ensure the current user is included in participants
      if (!participants.includes(user.id)) {
        participants.push(user.id);
      }

      // Check if a conversation with these exact participants already exists
      const { data: existingConversations, error: checkError } = await supabase
        .from('conversations')
        .select('*');

      if (checkError) {
        console.error('Error checking existing conversations:', checkError);
        return null;
      }

      // Filter conversations with the exact same participants
      const matchingConversation = existingConversations.find(conv => {
        const convParticipants = conv.participants || [];
        return (
          convParticipants.length === participants.length &&
          participants.every(p => convParticipants.includes(p))
        );
      });

      if (matchingConversation) {
        return matchingConversation as Conversation;
      }

      // Create a new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          title: title || null,
          participants,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        return null;
      }

      return data as Conversation;
    } catch (error) {
      console.error('Error in createConversation:', error);
      return null;
    }
  }

  /**
   * Get messages for a conversation
   * @param conversationId - The ID of the conversation
   * @param limit - Optional limit on number of messages to return
   * @returns List of messages
   */
  async getMessages(conversationId: string, limit?: number): Promise<Message[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, full_name, avatar_url),
          attachments:message_attachments(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      // Mark messages as read
      this.markMessagesAsRead(conversationId, user.id);

      return data as Message[];
    } catch (error) {
      console.error('Error in getMessages:', error);
      return [];
    }
  }

  /**
   * Send a message
   * @param conversationId - The ID of the conversation
   * @param content - The message content
   * @param attachments - Optional array of file attachments
   * @returns The sent message
   */
  async sendMessage(
    conversationId: string,
    content: string,
    attachments?: File[]
  ): Promise<Message | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Upload attachments if any
      let uploadedAttachments: MessageAttachment[] = [];
      if (attachments && attachments.length > 0) {
        uploadedAttachments = await this.uploadAttachments(attachments, user.id);
      }

      // Create the message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          attachments: uploadedAttachments.length > 0 ? uploadedAttachments : null
        })
        .select(`
          *,
          sender:sender_id(id, full_name, avatar_url)
        `)
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return null;
      }

      // Update conversation's last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data as Message;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return null;
    }
  }

  /**
   * Upload message attachments
   * @param files - Array of files to upload
   * @param userId - ID of the user uploading the files
   * @returns Array of uploaded attachment metadata
   */
  private async uploadAttachments(
    files: File[],
    userId: string
  ): Promise<MessageAttachment[]> {
    const attachments: MessageAttachment[] = [];

    for (const file of files) {
      try {
        const filePath = `attachments/${userId}/${Date.now()}_${file.name}`;
        
        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('message-attachments')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading attachment:', uploadError);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('message-attachments')
          .getPublicUrl(filePath);

        attachments.push({
          id: crypto.randomUUID(),
          message_id: '', // Will be set after message is created
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_path: urlData.publicUrl,
          created_at: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error processing attachment:', error);
      }
    }

    return attachments;
  }

  /**
   * Mark messages as read
   * @param conversationId - The ID of the conversation
   * @param userId - The ID of the user marking messages as read
   * @returns True if successful, false otherwise
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking messages as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error);
      return false;
    }
  }

  /**
   * Get notifications for the current user
   * @param limit - Optional limit on number of notifications to return
   * @returns List of notifications
   */
  async getNotifications(limit?: number): Promise<Notification[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data as Notification[];
    } catch (error) {
      console.error('Error in getNotifications:', error);
      return [];
    }
  }

  /**
   * Mark a notification as read
   * @param notificationId - The ID of the notification
   * @returns True if successful, false otherwise
   */
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markNotificationAsRead:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   * @returns True if successful, false otherwise
   */
  async markAllNotificationsAsRead(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAllNotificationsAsRead:', error);
      return false;
    }
  }
}

export const communicationService = new CommunicationService();
