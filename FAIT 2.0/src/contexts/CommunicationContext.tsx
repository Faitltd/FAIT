import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { communicationService } from '../services/CommunicationService';
import { Conversation, Message, Notification } from '../types/communication';
import { useAuth } from './AuthContext';

interface CommunicationContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  notifications: Notification[];
  unreadNotificationsCount: number;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isLoadingNotifications: boolean;
  error: string | null;
  setActiveConversation: (conversation: Conversation | null) => void;
  sendMessage: (conversationId: string, content: string) => Promise<Message | null>;
  createConversation: (recipientIds: string[], subject: string, initialMessage: string) => Promise<Conversation | null>;
  markNotificationAsRead: (notificationId: string) => Promise<boolean>;
  markAllNotificationsAsRead: () => Promise<boolean>;
  refreshNotifications: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  refreshMessages: (conversationId: string) => Promise<void>;
}

const CommunicationContext = createContext<CommunicationContextType | undefined>(undefined);

export const CommunicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      refreshConversations();
      refreshNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (activeConversation) {
      refreshMessages(activeConversation.id);
    }
  }, [activeConversation]);

  const refreshConversations = async () => {
    if (!user) return;
    
    setIsLoadingConversations(true);
    try {
      const data = await communicationService.getConversations();
      setConversations(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const refreshMessages = async (conversationId: string) => {
    if (!user) return;
    
    setIsLoadingMessages(true);
    try {
      const data = await communicationService.getMessages(conversationId);
      setMessages(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const refreshNotifications = async () => {
    if (!user) return;
    
    setIsLoadingNotifications(true);
    try {
      const data = await communicationService.getNotifications();
      setNotifications(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const sendMessage = async (conversationId: string, content: string): Promise<Message | null> => {
    if (!user) return null;
    
    try {
      const message = await communicationService.sendMessage(conversationId, content);
      if (message) {
        setMessages(prevMessages => [...prevMessages, message]);
        
        // Update conversation last message
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.id === conversationId 
              ? { 
                  ...conv, 
                  last_message: message,
                  updated_at: new Date().toISOString()
                } 
              : conv
          )
        );
      }
      return message;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return null;
    }
  };

  const createConversation = async (
    recipientIds: string[], 
    subject: string, 
    initialMessage: string
  ): Promise<Conversation | null> => {
    if (!user) return null;
    
    try {
      const conversation = await communicationService.createConversation(
        recipientIds,
        subject,
        initialMessage
      );
      
      if (conversation) {
        setConversations(prevConversations => [conversation, ...prevConversations]);
        setActiveConversation(conversation);
      }
      
      return conversation;
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError('Failed to create conversation');
      return null;
    }
  };

  const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const success = await communicationService.markNotificationAsRead(notificationId);
      if (success) {
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true } 
              : notification
          )
        );
      }
      return success;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read');
      return false;
    }
  };

  const markAllNotificationsAsRead = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const success = await communicationService.markAllNotificationsAsRead();
      if (success) {
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => ({ ...notification, is_read: true }))
        );
      }
      return success;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Failed to mark all notifications as read');
      return false;
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.is_read).length;

  const value = {
    conversations,
    activeConversation,
    messages,
    notifications,
    unreadNotificationsCount,
    isLoadingConversations,
    isLoadingMessages,
    isLoadingNotifications,
    error,
    setActiveConversation,
    sendMessage,
    createConversation,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refreshNotifications,
    refreshConversations,
    refreshMessages
  };

  return (
    <CommunicationContext.Provider value={value}>
      {children}
    </CommunicationContext.Provider>
  );
};

export const useCommunication = () => {
  const context = useContext(CommunicationContext);
  if (context === undefined) {
    throw new Error('useCommunication must be used within a CommunicationProvider');
  }
  return context;
};

export default CommunicationContext;
