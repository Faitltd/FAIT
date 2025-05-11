/**
 * Supabase Client Singleton
 * 
 * This module provides a centralized Supabase client to be used throughout the application,
 * preventing the "Multiple GoTrueClient instances" warning.
 */

import supabase from './/utils/supabaseClientSimple';;

// Environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Client options
const SUPABASE_OPTIONS = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
};

/**
 * Supabase client singleton class
 */
class SupabaseClientSingleton {
  private static instance: SupabaseClient | null = null;
  private static isInitializing = false;
  private static initPromise: Promise<SupabaseClient> | null = null;

  /**
   * Get the Supabase client instance
   * @returns Supabase client
   */
  public static async getClient(): Promise<SupabaseClient> {
    // If already initialized, return the instance
    if (SupabaseClientSingleton.instance) {
      return SupabaseClientSingleton.instance;
    }

    // If initialization is in progress, return the promise
    if (SupabaseClientSingleton.isInitializing && SupabaseClientSingleton.initPromise) {
      return SupabaseClientSingleton.initPromise;
    }

    // Start initialization
    SupabaseClientSingleton.isInitializing = true;
    SupabaseClientSingleton.initPromise = new Promise((resolve, reject) => {
      try {
        console.log('Initializing Supabase client with URL:', SUPABASE_URL);
        
        // Create the client
        // Using singleton Supabase client;
        
        // Store the instance
        SupabaseClientSingleton.instance = client;
        
        // Detect if we're using local Supabase
        const isLocalSupabase = SUPABASE_URL.includes('127.0.0.1') || SUPABASE_URL.includes('localhost');
        if (isLocalSupabase) {
          console.log('Using local authentication');
        }
        
        resolve(client);
      } catch (error) {
        console.error('Error initializing Supabase client:', error);
        reject(error);
      } finally {
        SupabaseClientSingleton.isInitializing = false;
      }
    });

    return SupabaseClientSingleton.initPromise;
  }

  /**
   * Reset the client (useful for testing)
   */
  public static reset(): void {
    SupabaseClientSingleton.instance = null;
    SupabaseClientSingleton.isInitializing = false;
    SupabaseClientSingleton.initPromise = null;
  }
}

/**
 * Get the Supabase client instance
 * @returns Supabase client
 */
export const getSupabaseClient = async (): Promise<SupabaseClient> => {
  return SupabaseClientSingleton.getClient();
};

/**
 * Test the Supabase connection
 * @returns True if connection is successful
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};

/**
 * Get the current authenticated user
 * @returns User object or null if not authenticated
 */
export const getCurrentUser = async () => {
  try {
    const supabase = await getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Check if the current user has admin role
 * @returns True if user is admin
 */
export const isAdminUser = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  
  if (!user) {
    console.log('No user, setting isAdminUser to false');
    return false;
  }
  
  // Check if user has admin role in metadata
  const isAdmin = user.app_metadata?.role === 'admin' || 
                 user.user_metadata?.role === 'admin';
  
  return isAdmin;
};

// Export a lazy-loaded singleton
export default {
  get client() {
    // This will throw a promise, but that's expected - the consumer should await getSupabaseClient()
    return getSupabaseClient();
  }
};
