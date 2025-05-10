/**
 * Supabase Admin Client
 * 
 * This module provides a Supabase client with admin privileges using the service role key.
 * It's configured to use the connection pooler for efficient database connections.
 * 
 * IMPORTANT: This should ONLY be used in server-side code, never in client-side code.
 */

import supabase from '../utils/supabaseClient';;

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!supabaseUrl) {
  console.error('Missing SUPABASE_URL environment variable');
}

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_KEY environment variable');
}

// Create Supabase admin client with connection pooling
// Using singleton Supabase client for efficient connection management
      poolMode: 'transaction'
    }
  }
);

export { supabaseAdmin };
