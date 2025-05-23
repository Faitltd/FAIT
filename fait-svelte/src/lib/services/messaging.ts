/**
 * Messaging Service
 * 
 * This module provides a centralized messaging service for sending and receiving messages.
 */

import { supabase } from './supabase';
import type { ApiError } from './api';

// Conversation type
export type Conversation = {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
};

// Message type
export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
};

/**
 * Process API response
 * @param response API response
 * @returns Processed data
 * @throws ApiError if response contains an error
 */
const processResponse = <T>(response: { data: T | null; error: any }) => {
  if (response.error) {
    console.error('Messaging API Error:', response.error);
    throw {
      message: response.error.message || 'An error occurred',
      status: response.error.status || 500,
      data: response.error
    };
  }
  return response.data;
};

/**
 * Messaging Service
 */
export const messagingService = {
  /**
   * Get conversations for a user
   * @param userId User ID
   * @returns List of conversations
   */
  getConversations: async (userId: string): Promise<Conversation[]> => {
    try {
      const response = await supabase
        .from('conversations')
        .select('*')
        .contains('participants', [userId])
        .order('updated_at', { ascending: false });

      return processResponse<any[]>(response).map(conversation => ({
        id: conversation.id,
        participants: conversation.participants,
        lastMessage: conversation.last_message,
        lastMessageTime: conversation.last_message_time,
        unreadCount: conversation.unread_count,
        bookingId: conversation.booking_id,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at
      }));
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  },

  /**
   * Get messages for a conversation
   * @param conversationId Conversation ID
   * @returns List of messages
   */
  getMessages: async (conversationId: string): Promise<Message[]> => {
    try {
      const response = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      return processResponse<any[]>(response).map(message => ({
        id: message.id,
        conversationId: message.conversation_id,
        senderId: message.sender_id,
        content: message.content,
        read: message.read,
        createdAt: message.created_at
      }));
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },

  /**
   * Send a message
   * @param conversationId Conversation ID
   * @param senderId Sender ID
   * @param content Message content
   * @returns Sent message
   */
  sendMessage: async (conversationId: string, senderId: string, content: string): Promise<Message> => {
    try {
      // Insert message
      const messageResponse = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          read: false
        })
        .select()
        .single();

      const message = processResponse<any>(messageResponse);

      // Update conversation with last message
      await supabase
        .from('conversations')
        .update({
          last_message: content,
          last_message_time: new Date().toISOString(),
          unread_count: supabase.raw('unread_count + 1')
        })
        .eq('id', conversationId);

      return {
        id: message.id,
        conversationId: message.conversation_id,
        senderId: message.sender_id,
        content: message.content,
        read: message.read,
        createdAt: message.created_at
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Create a new conversation
   * @param participants Array of participant user IDs
   * @param bookingId Optional booking ID
   * @returns Created conversation
   */
  createConversation: async (participants: string[], bookingId?: string): Promise<Conversation> => {
    try {
      const response = await supabase
        .from('conversations')
        .insert({
          participants,
          booking_id: bookingId,
          last_message: '',
          last_message_time: new Date().toISOString(),
          unread_count: 0
        })
        .select()
        .single();

      const conversation = processResponse<any>(response);

      return {
        id: conversation.id,
        participants: conversation.participants,
        lastMessage: conversation.last_message,
        lastMessageTime: conversation.last_message_time,
        unreadCount: conversation.unread_count,
        bookingId: conversation.booking_id,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at
      };
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  /**
   * Mark messages as read
   * @param conversationId Conversation ID
   * @param userId User ID
   */
  markAsRead: async (conversationId: string, userId: string): Promise<void> => {
    try {
      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId);

      // Reset unread count
      await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  /**
   * Get conversation by booking ID
   * @param bookingId Booking ID
   * @returns Conversation or null if not found
   */
  getConversationByBookingId: async (bookingId: string): Promise<Conversation | null> => {
    try {
      const response = await supabase
        .from('conversations')
        .select('*')
        .eq('booking_id', bookingId)
        .single();

      if (response.error && response.error.code === 'PGRST116') {
        // No conversation found
        return null;
      }

      const conversation = processResponse<any>(response);

      return {
        id: conversation.id,
        participants: conversation.participants,
        lastMessage: conversation.last_message,
        lastMessageTime: conversation.last_message_time,
        unreadCount: conversation.unread_count,
        bookingId: conversation.booking_id,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at
      };
    } catch (error) {
      console.error('Error getting conversation by booking ID:', error);
      throw error;
    }
  },

  /**
   * Get conversation between two users
   * @param userId1 First user ID
   * @param userId2 Second user ID
   * @returns Conversation or null if not found
   */
  getConversationBetweenUsers: async (userId1: string, userId2: string): Promise<Conversation | null> => {
    try {
      // This is a simplified approach - in a real app, you'd need a more sophisticated query
      const response = await supabase
        .from('conversations')
        .select('*')
        .contains('participants', [userId1])
        .contains('participants', [userId2]);

      const conversations = processResponse<any[]>(response);

      // Find conversation that has exactly these two participants
      const conversation = conversations.find(conv => 
        conv.participants.length === 2 && 
        conv.participants.includes(userId1) && 
        conv.participants.includes(userId2)
      );

      if (!conversation) {
        return null;
      }

      return {
        id: conversation.id,
        participants: conversation.participants,
        lastMessage: conversation.last_message,
        lastMessageTime: conversation.last_message_time,
        unreadCount: conversation.unread_count,
        bookingId: conversation.booking_id,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at
      };
    } catch (error) {
      console.error('Error getting conversation between users:', error);
      throw error;
    }
  }
};
