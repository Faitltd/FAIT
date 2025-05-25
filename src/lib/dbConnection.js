/**
 * Database Connection Utility
 * 
 * This module provides utilities for connecting to the Supabase database
 * with proper connection pooling.
 */

import supabase from '../utils/supabaseClient';;

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client with connection pooling
// Using singleton Supabase client;

export { supabaseClient };
