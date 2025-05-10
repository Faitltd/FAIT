import { createClient } from '@supabase/supabase-js';
import { Database } from './Database.types';
import { localSupabase } from './localSupabase';

// Default to local auth in development/test environments for reliability
const DEFAULT_LOCAL_AUTH = import.meta.env.MODE === 'development' || import.meta.env.MODE === 'test';

// Get Supabase credentials from environment variables
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback to hardcoded values if environment variables are not available
if (!supabaseUrl) {
  supabaseUrl = 'https://ydisdyadjupyswcpbxzu.supabase.co';
  console.log('Using hardcoded Supabase URL:', supabaseUrl);
}

if (!supabaseAnonKey) {
  supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXNkeWFkanVweXN3Y3BieHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzM1ODcsImV4cCI6MjA1OTAwOTU4N30.Iy_qqNtTzVi-XVKzBqDWOUGJdFV9ckLynR_bRLUvdnY';
  console.log('Using hardcoded Supabase Anon Key');
}

// Initialize auth mode from localStorage or default to local auth in development
let useLocalAuth = localStorage.getItem('useLocalAuth') === 'true' ||
                  (localStorage.getItem('useLocalAuth') === null && DEFAULT_LOCAL_AUTH);

// Create the Supabase client
let realSupabase: any;

try {
  if (supabaseUrl && supabaseAnonKey) {
    realSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storageKey: 'supabase.auth.token',
        storage: {
          getItem: (key) => {
            try {
              return localStorage.getItem(key);
            } catch (error) {
              console.error('Error accessing localStorage:', error);
              return null;
            }
          },
          setItem: (key, value) => {
            try {
              localStorage.setItem(key, value);
            } catch (error) {
              console.error('Error writing to localStorage:', error);
            }
          },
          removeItem: (key) => {
            try {
              localStorage.removeItem(key);
            } catch (error) {
              console.error('Error removing from localStorage:', error);
            }
          },
        },
      },
      db: {
        // Use the connection pooler for efficient connection management
        poolMode: 'transaction'
      }
    });
    console.log('Supabase client initialized successfully with URL:', supabaseUrl);

    // Test the connection
    realSupabase.auth.getSession()
      .then((response: any) => {
        if (response.error) {
          throw response.error;
        }
        console.log('Supabase connection test successful');
      })
      .catch((err: any) => {
        console.error('Supabase connection test failed:', err);
        // Force local auth if connection test fails in development
        if (import.meta.env.MODE === 'development' || import.meta.env.MODE === 'test') {
          console.warn('Forcing local auth mode due to connection failure in development/test environment');
          useLocalAuth = true;
          localStorage.setItem('useLocalAuth', 'true');
        }
      });
  } else {
    console.error('Missing Supabase environment variables. Authentication will not work.');
    // Force local auth if Supabase env vars are missing
    useLocalAuth = true;
    localStorage.setItem('useLocalAuth', 'true');
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Force local auth if Supabase client initialization fails
  useLocalAuth = true;
  localStorage.setItem('useLocalAuth', 'true');
}

// Log the current auth mode
console.log(`Using ${useLocalAuth ? 'local' : 'Supabase'} authentication`);

// Export either the real Supabase client or the local one
export const supabase = useLocalAuth ? localSupabase : realSupabase;

// Helper function to check current auth mode
export const isUsingLocalAuth = (): boolean => {
  return useLocalAuth;
};

// Helper function to toggle auth mode
export const toggleAuthMode = (newMode?: boolean, reload: boolean = false): boolean => {
  if (newMode !== undefined) {
    useLocalAuth = newMode;
  } else {
    useLocalAuth = !useLocalAuth;
  }

  // Persist the setting in localStorage
  localStorage.setItem('useLocalAuth', useLocalAuth.toString());

  console.log(`Auth mode changed to: ${useLocalAuth ? 'local' : 'Supabase'}`);

  // Optionally reload the page to apply changes
  if (reload && typeof window !== 'undefined') {
    window.location.reload();
  }

  return useLocalAuth;
};

// Helper function to get the current auth client (for debugging)
export const getAuthClient = () => {
  return useLocalAuth ? 'local' : 'supabase';
};
