import { writable } from 'svelte/store';

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

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false
};

export const auth = writable<AuthState>(initialState);

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
    auth.set(initialState);
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
