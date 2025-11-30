import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { createClient } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'provider' | 'admin';
}

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ydisdyadjupyswcpbxzu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Load initial state from localStorage if available
const getInitialState = (): AuthState => {
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

  // Listen to Supabase auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Supabase auth state changed:', event, session);

    if (session?.user) {
      const user: User = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
        role: 'client' // Default role, can be determined from user metadata
      };

      auth.update(state => ({
        ...state,
        user,
        isAuthenticated: true,
        isLoading: false
      }));
    } else if (event === 'SIGNED_OUT') {
      auth.update(state => ({
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false
      }));
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
        name: email.split('@')[0], // Use email username as name
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

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }

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

  // Google OAuth login
  loginWithGoogle: async () => {
    auth.update(state => ({ ...state, isLoading: true }));

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/oauth-callback`
        }
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      auth.update(state => ({ ...state, isLoading: false }));
      return { success: false, error: 'Failed to login with Google' };
    }
  },

  // Facebook OAuth login
  loginWithFacebook: async () => {
    auth.update(state => ({ ...state, isLoading: true }));

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/oauth-callback`
        }
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Facebook login error:', error);
      auth.update(state => ({ ...state, isLoading: false }));
      return { success: false, error: 'Failed to login with Facebook' };
    }
  },

  checkAuth: async () => {
    auth.update(state => ({ ...state, isLoading: true }));

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          role: 'client' // Default role, can be determined from user metadata
        };

        auth.update(state => ({
          ...state,
          user,
          isAuthenticated: true,
          isLoading: false
        }));
      } else {
        auth.update(state => ({
          ...state,
          user: null,
          isAuthenticated: false,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Auth check error:', error);
      auth.update(state => ({ ...state, isLoading: false }));
    }
  }
};
