/**
 * Supabase Client Singleton
 *
 * This file creates a single instance of the Supabase client to be used
 * throughout the application, preventing the "Multiple GoTrueClient instances"
 * warning.
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Create a single instance of the Supabase client
let supabaseInstance = null;

/**
 * Get the Supabase client instance
 *
 * @returns {Object} Supabase client
 */
export const getSupabase = () => {
  if (!supabaseInstance) {
    console.log('Creating new Supabase client instance');

    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });

      console.log('Supabase client initialized successfully with URL:', supabaseUrl);
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
      throw error;
    }
  }

  return supabaseInstance;
};

// Export the singleton instance directly
const supabase = getSupabase();

export default supabase;

/**
 * Test the Supabase connection
 *
 * @returns {Promise<boolean>} True if connection is successful
 */
export const testSupabaseConnection = async () => {
  try {
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
 *
 * @returns {Promise<Object|null>} User object or null if not authenticated
 */
export const getCurrentUser = async () => {
  try {
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
 *
 * @returns {Promise<boolean>} True if user is admin
 */
export const isAdminUser = async () => {
  const user = await getCurrentUser();

  if (!user) {
    console.log('No user, setting isAdminUser to false');
    return false;
  }

  // Check if user has admin role in metadata
  // This depends on how roles are stored in your Supabase setup
  const isAdmin = user.app_metadata?.role === 'admin' ||
                 user.user_metadata?.role === 'admin';

  return isAdmin;
};
