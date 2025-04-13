import { createClient } from '@supabase/supabase-js';
import { Database } from './Database.types';
import { localSupabase, shouldUseLocalAuth, setLocalAuthMode } from './localSupabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create the real Supabase client
let realSupabase: any;

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Using local auth.');
    setLocalAuthMode(true);
  } else {
    realSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      }
    });
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  console.warn('Falling back to local authentication.');
  setLocalAuthMode(true);
}

// Export a proxy that will use either the real Supabase client or the local one
export const supabase = new Proxy({}, {
  get: (target, prop) => {
    // Check if we should use local auth
    if (shouldUseLocalAuth()) {
      console.log(`Using local auth for ${String(prop)}`);
      return localSupabase[prop as keyof typeof localSupabase];
    }

    // Try to use the real Supabase client
    try {
      if (!realSupabase) {
        throw new Error('Supabase client not initialized');
      }

      return realSupabase[prop as keyof typeof realSupabase];
    } catch (error) {
      console.error(`Error accessing Supabase ${String(prop)}:`, error);
      console.warn(`Falling back to local auth for ${String(prop)}`);
      setLocalAuthMode(true);
      return localSupabase[prop as keyof typeof localSupabase];
    }
  }
}) as typeof realSupabase;

// Helper function to toggle between local and remote auth
export const toggleAuthMode = (useLocal: boolean): void => {
  setLocalAuthMode(useLocal);
  console.log(`Switched to ${useLocal ? 'local' : 'remote'} authentication mode`);
};

// Helper function to check current auth mode
export const isUsingLocalAuth = (): boolean => {
  return shouldUseLocalAuth();
};
