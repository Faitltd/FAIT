import { createClient } from '@supabase/supabase-js';
import { Database } from './Database.types';
import { localSupabase } from './localSupabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use local auth for development simplicity (can be toggled)
let useLocalAuth = true;

// Create the Supabase client (will only be used if not in local auth mode)
let realSupabase: any;

if (!useLocalAuth) {
  try {
    if (supabaseUrl && supabaseAnonKey) {
      realSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
        }
      });
    } else {
      console.warn('Missing Supabase environment variables.');
    }
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
  }
}

// Export either the real Supabase client or the local one
export const supabase = useLocalAuth ? localSupabase : realSupabase;

// Helper function to check current auth mode
export const isUsingLocalAuth = (): boolean => {
  return useLocalAuth;
};

// Helper function to toggle auth mode
export const toggleAuthMode = (newMode?: boolean): boolean => {
  if (newMode !== undefined) {
    useLocalAuth = newMode;
  } else {
    useLocalAuth = !useLocalAuth;
  }
  return useLocalAuth;
};
