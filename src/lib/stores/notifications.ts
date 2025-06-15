import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Define notification interface
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  link?: string;
  createdAt: string;
}

// Mock notifications data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    userId: '1',
    title: 'Booking Confirmed',
    message: 'Your booking for Home Cleaning on June 15 has been confirmed.',
    type: 'success',
    read: false,
    link: '/bookings/1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    userId: '1',
    title: 'New Message',
    message: 'You have a new message from Service Provider regarding your booking.',
    type: 'info',
    read: false,
    link: '/messages/1',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    userId: '1',
    title: 'Payment Processed',
    message: 'Your payment of $75 for Home Cleaning has been processed successfully.',
    type: 'success',
    read: true,
    link: '/payments/1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    userId: '2',
    title: 'New Booking Request',
    message: 'You have a new booking request for Home Cleaning on June 16.',
    type: 'info',
    read: false,
    link: '/provider/bookings/2',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    userId: '2',
    title: 'Booking Completed',
    message: 'Your booking with John Smith has been marked as completed.',
    type: 'success',
    read: true,
    link: '/provider/bookings/1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Initial state
const initialState = {
  notifications: [] as Notification[],
  isLoading: false,
  error: null as string | null
};

// Create the store
const createNotificationsStore = () => {
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    
    // Load notifications for a user
    loadUserNotifications: async (userId: string) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        // In a real app, this would be an API call
        // Simulating API call with timeout
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Filter notifications for the user
        const userNotifications = MOCK_NOTIFICATIONS.filter(notification => notification.userId === userId);
        
        // Sort by creation date (newest first)
        userNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        update(state => ({
          ...state,
          notifications: userNotifications,
          isLoading: false,
          error: null
        }));
        
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load notifications';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Mark notification as read
    markAsRead: async (notificationId: string) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        // In a real app, this would be an API call
        // Simulating API call with timeout
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Find notification index
        const notificationIndex = MOCK_NOTIFICATIONS.findIndex(notification => notification.id === notificationId);
        
        if (notificationIndex === -1) {
          throw new Error('Notification not found');
        }
        
        // Mark as read
        MOCK_NOTIFICATIONS[notificationIndex] = {
          ...MOCK_NOTIFICATIONS[notificationIndex],
          read: true
        };
        
        // Update store
        update(state => {
          const updatedNotifications = [...state.notifications];
          const storeNotificationIndex = updatedNotifications.findIndex(notification => notification.id === notificationId);
          
          if (storeNotificationIndex !== -1) {
            updatedNotifications[storeNotificationIndex] = {
              ...updatedNotifications[storeNotificationIndex],
              read: true
            };
          }
          
          return {
            ...state,
            notifications: updatedNotifications,
            isLoading: false,
            error: null
          };
        });
        
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to mark notification as read';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Mark all notifications as read
    markAllAsRead: async (userId: string) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        // In a real app, this would be an API call
        // Simulating API call with timeout
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mark all user notifications as read
        MOCK_NOTIFICATIONS.forEach(notification => {
          if (notification.userId === userId) {
            notification.read = true;
          }
        });
        
        // Update store
        update(state => ({
          ...state,
          notifications: state.notifications.map(notification => ({
            ...notification,
            read: true
          })),
          isLoading: false,
          error: null
        }));
        
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to mark all notifications as read';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Add a new notification
    addNotification: async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        // In a real app, this would be an API call
        // Simulating API call with timeout
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Create new notification
        const newNotification: Notification = {
          ...notification,
          id: `${MOCK_NOTIFICATIONS.length + 1}`,
          createdAt: new Date().toISOString()
        };
        
        // Add to mock notifications
        MOCK_NOTIFICATIONS.push(newNotification);
        
        // Update store if it's for the current user
        update(state => {
          if (state.notifications.some(n => n.userId === notification.userId)) {
            return {
              ...state,
              notifications: [newNotification, ...state.notifications],
              isLoading: false,
              error: null
            };
          }
          
          return {
            ...state,
            isLoading: false,
            error: null
          };
        });
        
        return { success: true, notification: newNotification };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add notification';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Clear error
    clearError: () => {
      update(state => ({ ...state, error: null }));
    }
  };
};

// Export the store
export const notifications = createNotificationsStore();
