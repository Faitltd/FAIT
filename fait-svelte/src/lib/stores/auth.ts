import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Define user type
type User = {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'provider' | 'admin';
  avatar?: string;
};

// Define auth store type
type AuthStore = {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
};

// Initial state
const initialState: AuthStore = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null
};

// Create the store
const createAuthStore = () => {
  const { subscribe, set, update } = writable<AuthStore>(initialState);

  return {
    subscribe,
    
    // Check if user is already authenticated
    checkAuth: () => {
      if (!browser) return;
      
      // Try to get token from localStorage
      const token = localStorage.getItem('fait_token');
      const userJson = localStorage.getItem('fait_user');
      
      if (token && userJson) {
        try {
          const user = JSON.parse(userJson);
          update(state => ({
            ...state,
            isAuthenticated: true,
            user,
            token
          }));
        } catch (e) {
          // Invalid user JSON, clear storage
          localStorage.removeItem('fait_token');
          localStorage.removeItem('fait_user');
        }
      }
    },
    
    // Login user
    login: async (email: string, password: string) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        // This is a mock implementation
        // In a real app, you would make an API call here
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock successful login
        const mockUser: User = {
          id: '123',
          name: 'Demo User',
          email,
          role: 'client'
        };
        
        const mockToken = 'mock_jwt_token';
        
        // Save to localStorage
        if (browser) {
          localStorage.setItem('fait_token', mockToken);
          localStorage.setItem('fait_user', JSON.stringify(mockUser));
        }
        
        // Update store
        update(state => ({
          ...state,
          isAuthenticated: true,
          user: mockUser,
          token: mockToken,
          loading: false
        }));
        
        return true;
      } catch (error) {
        update(state => ({
          ...state,
          loading: false,
          error: 'Login failed. Please check your credentials.'
        }));
        return false;
      }
    },
    
    // Register user
    register: async (name: string, email: string, password: string) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        // This is a mock implementation
        // In a real app, you would make an API call here
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock successful registration
        const mockUser: User = {
          id: '123',
          name,
          email,
          role: 'client'
        };
        
        const mockToken = 'mock_jwt_token';
        
        // Save to localStorage
        if (browser) {
          localStorage.setItem('fait_token', mockToken);
          localStorage.setItem('fait_user', JSON.stringify(mockUser));
        }
        
        // Update store
        update(state => ({
          ...state,
          isAuthenticated: true,
          user: mockUser,
          token: mockToken,
          loading: false
        }));
        
        return true;
      } catch (error) {
        update(state => ({
          ...state,
          loading: false,
          error: 'Registration failed. Please try again.'
        }));
        return false;
      }
    },
    
    // Logout user
    logout: () => {
      // Clear localStorage
      if (browser) {
        localStorage.removeItem('fait_token');
        localStorage.removeItem('fait_user');
      }
      
      // Reset store to initial state
      set(initialState);
    },
    
    // Clear any errors
    clearError: () => {
      update(state => ({ ...state, error: null }));
    }
  };
};

// Export the store
export const auth = createAuthStore();
