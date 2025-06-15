/**
 * Supabase Client Singleton
 * 
 * This module provides a centralized Supabase client to be used throughout the application,
 * preventing the "Multiple GoTrueClient instances" warning.
 */

import { createClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Define types for Supabase tables
export type Profile = {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  email?: string;
  phone?: string;
  address?: string;
  bio?: string;
  role: 'client' | 'provider' | 'admin';
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  price_type: 'hourly' | 'fixed';
  duration: number;
  active: boolean;
  image_url?: string;
  provider_id: string;
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: string;
  service_id: string;
  provider_id: string;
  client_id: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  address: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

// Create a single instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null;

/**
 * Get the Supabase client instance
 * @returns Supabase client
 */
export const getSupabase = () => {
  if (!browser) {
    // Return a mock client for SSR
    return createMockSupabaseClient();
  }

  if (!supabaseInstance) {
    console.log('Creating new Supabase client instance');

    try {
      const supabaseUrl = PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase environment variables');
        throw new Error('Missing Supabase environment variables');
      }

      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });

      console.log('Supabase client initialized successfully');
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
      throw error;
    }
  }

  return supabaseInstance;
};

/**
 * Create a mock Supabase client for SSR
 * @returns Mock Supabase client
 */
const createMockSupabaseClient = () => {
  // This is a simplified mock that returns empty data
  // Expand as needed for SSR functionality
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: null })
      })
    })
  } as unknown as ReturnType<typeof createClient>;
};

// Export the singleton instance
export const supabase = getSupabase();
