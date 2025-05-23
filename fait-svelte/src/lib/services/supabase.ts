/**
 * Supabase Client
 * 
 * This module provides a centralized Supabase client to be used throughout the application,
 * preventing the "Multiple GoTrueClient instances" warning.
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const PUBLIC_SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const PUBLIC_SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Create a single instance of the Supabase client
let supabaseInstance = null;

// Client options
const SUPABASE_OPTIONS = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
};

/**
 * Get the Supabase client instance
 * @returns Supabase client
 */
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, SUPABASE_OPTIONS);

// Type definitions for Supabase tables
export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'client' | 'provider' | 'admin';
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  provider_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
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
}
