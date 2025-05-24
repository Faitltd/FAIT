import { writable } from 'svelte/store';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'provider' | 'admin';
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    role: 'client' | 'provider' | 'admin';
    avatar?: string;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  bookingId?: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
}

interface MessagesState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null
};

function createMessagesStore() {
  const { subscribe, set, update } = writable<MessagesState>(initialState);

  return {
    subscribe,

    // Load user conversations
    async loadConversations(userId: string) {
      update(state => ({ ...state, isLoading: true, error: null }));

      try {
        // Mock data for demo
        const mockConversations: Conversation[] = [
          {
            id: '1',
            participants: [
              { id: userId, name: 'You', role: 'client' },
              { id: 'provider-1', name: 'John Smith', role: 'provider' }
            ],
            lastMessage: {
              id: 'msg-1',
              conversationId: '1',
              senderId: 'provider-1',
              senderName: 'John Smith',
              senderRole: 'provider',
              content: 'I can start the plumbing work tomorrow morning. What time works best for you?',
              timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
              isRead: false
            },
            unreadCount: 2,
            bookingId: 'booking-1',
            subject: 'Kitchen Sink Repair',
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            updatedAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: '2',
            participants: [
              { id: userId, name: 'You', role: 'client' },
              { id: 'provider-2', name: 'Sarah Johnson', role: 'provider' }
            ],
            lastMessage: {
              id: 'msg-2',
              conversationId: '2',
              senderId: userId,
              senderName: 'You',
              senderRole: 'client',
              content: 'Thank you for the great work! The pictures look perfect.',
              timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
              isRead: true
            },
            unreadCount: 0,
            bookingId: 'booking-2',
            subject: 'Picture Hanging Service',
            createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            updatedAt: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: '3',
            participants: [
              { id: userId, name: 'You', role: 'client' },
              { id: 'admin-1', name: 'FAIT Support', role: 'admin' }
            ],
            lastMessage: {
              id: 'msg-3',
              conversationId: '3',
              senderId: 'admin-1',
              senderName: 'FAIT Support',
              senderRole: 'admin',
              content: 'Your refund has been processed and should appear in your account within 3-5 business days.',
              timestamp: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
              isRead: true
            },
            unreadCount: 0,
            subject: 'Refund Request',
            createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
            updatedAt: new Date(Date.now() - 345600000).toISOString()
          }
        ];

        update(state => ({
          ...state,
          conversations: mockConversations,
          isLoading: false
        }));

        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load conversations';
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));

        return { success: false, error: errorMessage };
      }
    },

    // Load messages for a conversation
    async loadMessages(conversationId: string) {
      update(state => ({ ...state, isLoading: true, error: null }));

      try {
        // Mock messages for demo
        const mockMessages: Message[] = [
          {
            id: 'msg-1-1',
            conversationId,
            senderId: 'client-1',
            senderName: 'You',
            senderRole: 'client',
            content: 'Hi, I need help with my kitchen sink. It\'s been leaking for a few days now.',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            isRead: true
          },
          {
            id: 'msg-1-2',
            conversationId,
            senderId: 'provider-1',
            senderName: 'John Smith',
            senderRole: 'provider',
            content: 'Hello! I\'d be happy to help with your sink repair. Can you describe the type of leak you\'re experiencing?',
            timestamp: new Date(Date.now() - 82800000).toISOString(),
            isRead: true
          },
          {
            id: 'msg-1-3',
            conversationId,
            senderId: 'client-1',
            senderName: 'You',
            senderRole: 'client',
            content: 'It\'s dripping from the faucet base, and there\'s also some water pooling under the sink.',
            timestamp: new Date(Date.now() - 79200000).toISOString(),
            isRead: true
          },
          {
            id: 'msg-1-4',
            conversationId,
            senderId: 'provider-1',
            senderName: 'John Smith',
            senderRole: 'provider',
            content: 'That sounds like it could be a worn O-ring or loose connection. I can come take a look and give you an estimate. I can start the plumbing work tomorrow morning. What time works best for you?',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            isRead: false
          }
        ];

        // Find and set current conversation
        const conversation = mockMessages.length > 0 ? {
          id: conversationId,
          participants: [
            { id: 'client-1', name: 'You', role: 'client' as const },
            { id: 'provider-1', name: 'John Smith', role: 'provider' as const }
          ],
          subject: 'Kitchen Sink Repair',
          unreadCount: 1,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString()
        } : null;

        update(state => ({
          ...state,
          messages: mockMessages,
          currentConversation: conversation,
          isLoading: false
        }));

        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load messages';
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));

        return { success: false, error: errorMessage };
      }
    },

    // Send a message
    async sendMessage(conversationId: string, content: string, senderId: string, senderName: string, senderRole: 'client' | 'provider' | 'admin') {
      try {
        const newMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          conversationId,
          senderId,
          senderName,
          senderRole,
          content,
          timestamp: new Date().toISOString(),
          isRead: true
        };

        update(state => ({
          ...state,
          messages: [...state.messages, newMessage]
        }));

        return { success: true, message: newMessage };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
        update(state => ({
          ...state,
          error: errorMessage
        }));

        return { success: false, error: errorMessage };
      }
    },

    // Mark messages as read
    async markAsRead(conversationId: string) {
      try {
        update(state => ({
          ...state,
          messages: state.messages.map(message =>
            message.conversationId === conversationId
              ? { ...message, isRead: true }
              : message
          ),
          conversations: state.conversations.map(conversation =>
            conversation.id === conversationId
              ? { ...conversation, unreadCount: 0 }
              : conversation
          )
        }));

        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to mark messages as read';
        return { success: false, error: errorMessage };
      }
    },

    // Set current conversation
    setCurrentConversation(conversation: Conversation | null) {
      update(state => ({
        ...state,
        currentConversation: conversation
      }));
    },

    // Reset store
    reset() {
      set(initialState);
    }
  };
}

export const messages = createMessagesStore();
