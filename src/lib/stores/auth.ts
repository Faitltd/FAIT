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
    flowType: 'pkce',
    // COST OPTIMIZATION: Reduce refresh frequency to minimize API calls
    refreshTokenMargin: 300, // Refresh 5 minutes before expiry instead of default 10 seconds
    retryDelayMs: 2000, // Increase retry delay to reduce rapid retries
    maxRetries: 3 // Limit retry attempts
  }
});

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Get user profile to determine role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type, full_name')
          .eq('id', data.user.id)
          .single();

        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
          role: profile?.user_type || 'client'
        };

        auth.update(state => ({
          ...state,
          user,
          isAuthenticated: true,
          isLoading: false
        }));

        return { success: true };
      }

      throw new Error('No user data received');
    } catch (error) {
      auth.update(state => ({ ...state, isLoading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
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

  signup: async (email: string, password: string, userData: any) => {
    auth.update(state => ({ ...state, isLoading: true }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.name || email.split('@')[0],
            user_type: userData.role || 'client'
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: userData.name || email.split('@')[0],
            user_type: userData.role || 'client',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Continue anyway as the user was created
        }

        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: userData.name || email.split('@')[0],
          role: userData.role || 'client'
        };

        auth.update(state => ({
          ...state,
          user,
          isAuthenticated: true,
          isLoading: false
        }));

        return { success: true };
      }

      throw new Error('No user data received');
    } catch (error) {
      auth.update(state => ({ ...state, isLoading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signup failed'
      };
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
        // Get user profile to determine role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type, full_name')
          .eq('id', session.user.id)
          .single();

        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          role: profile?.user_type || session.user.user_metadata?.user_type || 'client'
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
