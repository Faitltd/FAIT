import { writable, derived } from 'svelte/store';
import { messagingService } from '$lib/services/messaging';
import type { Conversation, Message } from '$lib/services/messaging';
import { auth } from './auth';
import { get } from 'svelte/store';

// Initial state
const initialState = {
  conversations: [] as Conversation[],
  currentConversation: null as string | null,
  messages: {} as Record<string, Message[]>,
  isLoading: false,
  error: null as string | null
};

// Create the store
const createMessagingStore = () => {
  const { subscribe, set, update } = writable(initialState);

  // Create derived store for current messages
  const currentMessages = derived({ subscribe }, $messaging => {
    if (!$messaging.currentConversation) return [];
    return $messaging.messages[$messaging.currentConversation] || [];
  });

  // Create derived store for unread count
  const unreadCount = derived({ subscribe }, $messaging => {
    return $messaging.conversations.reduce((total, conversation) => {
      return total + conversation.unreadCount;
    }, 0);
  });

  return {
    subscribe,
    currentMessages,
    unreadCount,
    
    // Load conversations for the current user
    loadConversations: async () => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const authState = get(auth);
        
        if (!authState.user) {
          throw new Error('User not authenticated');
        }
        
        const conversations = await messagingService.getConversations(authState.user.id);
        
        update(state => ({
          ...state,
          conversations,
          isLoading: false,
          error: null
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
    loadMessages: async (conversationId: string) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const messages = await messagingService.getMessages(conversationId);
        
        update(state => ({
          ...state,
          messages: {
            ...state.messages,
            [conversationId]: messages
          },
          currentConversation: conversationId,
          isLoading: false,
          error: null
        }));
        
        // Mark messages as read
        const authState = get(auth);
        if (authState.user) {
          await messagingService.markAsRead(conversationId, authState.user.id);
          
          // Update unread count in conversations
          update(state => ({
            ...state,
            conversations: state.conversations.map(conversation => {
              if (conversation.id === conversationId) {
                return { ...conversation, unreadCount: 0 };
              }
              return conversation;
            })
          }));
        }
        
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
    sendMessage: async (conversationId: string, content: string) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const authState = get(auth);
        
        if (!authState.user) {
          throw new Error('User not authenticated');
        }
        
        const message = await messagingService.sendMessage(conversationId, authState.user.id, content);
        
        update(state => {
          // Update messages
          const conversationMessages = state.messages[conversationId] || [];
          
          // Update conversations
          const updatedConversations = state.conversations.map(conversation => {
            if (conversation.id === conversationId) {
              return {
                ...conversation,
                lastMessage: content,
                lastMessageTime: message.createdAt
              };
            }
            return conversation;
          });
          
          return {
            ...state,
            messages: {
              ...state.messages,
              [conversationId]: [...conversationMessages, message]
            },
            conversations: updatedConversations,
            isLoading: false,
            error: null
          };
        });
        
        return { success: true, message };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Create a new conversation
    createConversation: async (participantId: string, bookingId?: string) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const authState = get(auth);
        
        if (!authState.user) {
          throw new Error('User not authenticated');
        }
        
        // Check if conversation already exists
        const existingConversation = await messagingService.getConversationBetweenUsers(
          authState.user.id,
          participantId
        );
        
        if (existingConversation) {
          update(state => ({
            ...state,
            currentConversation: existingConversation.id,
            isLoading: false,
            error: null
          }));
          
          return { success: true, conversation: existingConversation };
        }
        
        // Create new conversation
        const conversation = await messagingService.createConversation(
          [authState.user.id, participantId],
          bookingId
        );
        
        update(state => ({
          ...state,
          conversations: [conversation, ...state.conversations],
          currentConversation: conversation.id,
          isLoading: false,
          error: null
        }));
        
        return { success: true, conversation };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create conversation';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Get or create conversation for a booking
    getOrCreateConversationForBooking: async (bookingId: string, providerId: string, clientId: string) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        // Check if conversation already exists for this booking
        const existingConversation = await messagingService.getConversationByBookingId(bookingId);
        
        if (existingConversation) {
          update(state => ({
            ...state,
            currentConversation: existingConversation.id,
            isLoading: false,
            error: null
          }));
          
          return { success: true, conversation: existingConversation };
        }
        
        // Create new conversation
        const conversation = await messagingService.createConversation(
          [providerId, clientId],
          bookingId
        );
        
        update(state => ({
          ...state,
          conversations: [conversation, ...state.conversations],
          currentConversation: conversation.id,
          isLoading: false,
          error: null
        }));
        
        return { success: true, conversation };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to get or create conversation';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Set current conversation
    setCurrentConversation: (conversationId: string | null) => {
      update(state => ({ ...state, currentConversation: conversationId }));
    },
    
    // Clear error
    clearError: () => {
      update(state => ({ ...state, error: null }));
    },
    
    // Reset store
    reset: () => {
      set(initialState);
    }
  };
};

// Export the store
export const messaging = createMessagingStore();
