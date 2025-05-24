import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'provider' | 'admin';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Load initial state from localStorage if available
const getInitialState = (): AuthState => {
  // For debugging, let's start with a clean state
  // Comment out localStorage loading temporarily
  /*
  if (browser) {
    try {
      const stored = localStorage.getItem('auth');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored auth state:', e);
    }
  }
  */

  return {
    user: null,
    isAuthenticated: false,
    isLoading: false
  };
};

export const auth = writable<AuthState>(getInitialState());

// Subscribe to auth changes and persist to localStorage
if (browser) {
  auth.subscribe((state) => {
    try {
      localStorage.setItem('auth', JSON.stringify(state));
    } catch (e) {
      console.error('Failed to store auth state:', e);
    }
  });
}

// Auth actions
export const authActions = {
  login: async (email: string, password: string) => {
    auth.update(state => ({ ...state, isLoading: true }));

    try {
      // TODO: Implement actual authentication
      // For now, simulate login
      const mockUser: User = {
        id: '1',
        email,
        name: 'Demo User',
        role: 'client'
      };

      auth.update(state => ({
        ...state,
        user: mockUser,
        isAuthenticated: true,
        isLoading: false
      }));

      return { success: true };
    } catch (error) {
      auth.update(state => ({ ...state, isLoading: false }));
      return { success: false, error: 'Login failed' };
    }
  },

  logout: () => {
    const initialState = {
      user: null,
      isAuthenticated: false,
      isLoading: false
    };
    auth.set(initialState);
    if (browser) {
      localStorage.removeItem('auth');
    }
  },

  checkAuth: async () => {
    auth.update(state => ({ ...state, isLoading: true }));

    try {
      // TODO: Check if user is authenticated (e.g., check token)
      auth.update(state => ({ ...state, isLoading: false }));
    } catch (error) {
      auth.update(state => ({ ...state, isLoading: false }));
    }
  }
};
