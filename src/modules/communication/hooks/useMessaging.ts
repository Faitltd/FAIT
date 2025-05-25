import { useState, useEffect, useCallback } from 'react';
import { communicationService } from '../services/communicationService';
import { 
  Conversation, 
  Message, 
  MessageType,
  AttachmentType
} from '../types/communication';
import { PaginatedResult, QueryParams } from '../../core/types/common';

interface UseMessagingResult {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  error: string | null;
  totalConversations: number;
  totalMessages: number;
  unreadCount: number;
  fetchConversations: (params?: QueryParams) => Promise<void>;
  fetchMessages: (conversationId: string, params?: QueryParams) => Promise<void>;
  selectConversation: (conversation: Conversation) => void;
  sendMessage: (content: string, type?: MessageType) => Promise<Message>;
  sendMessageWithAttachment: (content: string, file: File, type: AttachmentType) => Promise<Message>;
  markMessagesAsRead: (messageIds: string[]) => Promise<void>;
  createConversation: (participantIds: string[], title?: string) => Promise<Conversation>;
  archiveConversation: (id: string) => Promise<Conversation>;
}

/**
 * Hook for managing messaging
 */
export function useMessaging(initialConversationId?: string): UseMessagingResult {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalConversations, setTotalConversations] = useState<number>(0);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Fetch conversations
  const fetchConversations = useCallback(async (params?: QueryParams) => {
    setIsLoadingConversations(true);
    setError(null);

    try {
      const response = await communicationService.getConversations(params);
      const result = response.data;
      
      setConversations(result.data);
      setTotalConversations(result.total);
      
      // If initialConversationId is provided, select that conversation
      if (initialConversationId && !selectedConversation) {
        const conversation = result.data.find(c => c.id === initialConversationId);
        if (conversation) {
          setSelectedConversation(conversation);
        }
      }
      
      // Calculate total unread count
      const totalUnread = result.data.reduce((sum, conversation) => sum + conversation.unreadCount, 0);
      setUnreadCount(totalUnread);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setIsLoadingConversations(false);
    }
  }, [initialConversationId, selectedConversation]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string, params?: QueryParams) => {
    setIsLoadingMessages(true);
    setError(null);

    try {
      const response = await communicationService.getMessages(conversationId, params);
      const result = response.data;
      
      setMessages(result.data);
      setTotalMessages(result.total);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Select a conversation
  const selectConversation = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Fetch messages for the selected conversation
    fetchMessages(conversation.id, { pagination: { page: 1, limit: 20 } });
    
    // If the conversation has unread messages, mark them as read
    if (conversation.unreadCount > 0) {
      // In a real app, you would fetch unread messages and mark them as read
      // For now, we'll just update the unread count in the UI
      setConversations(prevConversations =>
        prevConversations.map(c =>
          c.id === conversation.id ? { ...c, unreadCount: 0 } : c
        )
      );
      
      // Update total unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - conversation.unreadCount));
    }
  }, [fetchMessages]);

  // Send a message
  const sendMessage = useCallback(async (content: string, type: MessageType = MessageType.TEXT): Promise<Message> => {
    if (!selectedConversation) {
      throw new Error('No conversation selected');
    }
    
    setError(null);

    try {
      const response = await communicationService.sendMessage(
        selectedConversation.id,
        content,
        type
      );
      
      const newMessage = response.data;
      
      // Add the new message to the messages list
      setMessages(prevMessages => [newMessage, ...prevMessages]);
      
      // Update the last message in the selected conversation
      setSelectedConversation(prevConversation => {
        if (!prevConversation) return null;
        return {
          ...prevConversation,
          lastMessage: newMessage
        };
      });
      
      // Update the conversations list
      setConversations(prevConversations =>
        prevConversations.map(c =>
          c.id === selectedConversation.id
            ? { ...c, lastMessage: newMessage }
            : c
        )
      );
      
      return newMessage;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  }, [selectedConversation]);

  // Send a message with attachment
  const sendMessageWithAttachment = useCallback(
    async (content: string, file: File, type: AttachmentType): Promise<Message> => {
      if (!selectedConversation) {
        throw new Error('No conversation selected');
      }
      
      setError(null);

      try {
        const response = await communicationService.sendMessageWithAttachment(
          selectedConversation.id,
          content,
          file,
          type
        );
        
        const newMessage = response.data;
        
        // Add the new message to the messages list
        setMessages(prevMessages => [newMessage, ...prevMessages]);
        
        // Update the last message in the selected conversation
        setSelectedConversation(prevConversation => {
          if (!prevConversation) return null;
          return {
            ...prevConversation,
            lastMessage: newMessage
          };
        });
        
        // Update the conversations list
        setConversations(prevConversations =>
          prevConversations.map(c =>
            c.id === selectedConversation.id
              ? { ...c, lastMessage: newMessage }
              : c
          )
        );
        
        return newMessage;
      } catch (err) {
        console.error('Error sending message with attachment:', err);
        setError(err instanceof Error ? err.message : 'Failed to send message with attachment');
        throw err;
      }
    },
    [selectedConversation]
  );

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (messageIds: string[]): Promise<void> => {
    if (!selectedConversation) {
      throw new Error('No conversation selected');
    }
    
    setError(null);

    try {
      await communicationService.markMessagesAsRead(selectedConversation.id, messageIds);
      
      // Update the unread count in the selected conversation
      setSelectedConversation(prevConversation => {
        if (!prevConversation) return null;
        return {
          ...prevConversation,
          unreadCount: 0
        };
      });
      
      // Update the conversations list
      setConversations(prevConversations =>
        prevConversations.map(c =>
          c.id === selectedConversation.id
            ? { ...c, unreadCount: 0 }
            : c
        )
      );
      
      // Update total unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - messageIds.length));
    } catch (err) {
      console.error('Error marking messages as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark messages as read');
      throw err;
    }
  }, [selectedConversation]);

  // Create a new conversation
  const createConversation = useCallback(async (participantIds: string[], title?: string): Promise<Conversation> => {
    setError(null);

    try {
      const response = await communicationService.createConversation(participantIds, title);
      const newConversation = response.data;
      
      // Add the new conversation to the conversations list
      setConversations(prevConversations => [newConversation, ...prevConversations]);
      
      // Select the new conversation
      setSelectedConversation(newConversation);
      
      // Fetch messages for the new conversation
      fetchMessages(newConversation.id, { pagination: { page: 1, limit: 20 } });
      
      return newConversation;
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      throw err;
    }
  }, [fetchMessages]);

  // Archive a conversation
  const archiveConversation = useCallback(async (id: string): Promise<Conversation> => {
    setError(null);

    try {
      const response = await communicationService.archiveConversation(id);
      const archivedConversation = response.data;
      
      // Update the conversations list
      setConversations(prevConversations =>
        prevConversations.map(c =>
          c.id === id ? archivedConversation : c
        )
      );
      
      // If the archived conversation is the selected one, deselect it
      if (selectedConversation?.id === id) {
        setSelectedConversation(null);
        setMessages([]);
      }
      
      return archivedConversation;
    } catch (err) {
      console.error('Error archiving conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to archive conversation');
      throw err;
    }
  }, [selectedConversation]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations({ pagination: { page: 1, limit: 20 } });
  }, [fetchConversations]);

  return {
    conversations,
    selectedConversation,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    error,
    totalConversations,
    totalMessages,
    unreadCount,
    fetchConversations,
    fetchMessages,
    selectConversation,
    sendMessage,
    sendMessageWithAttachment,
    markMessagesAsRead,
    createConversation,
    archiveConversation,
  };
}
