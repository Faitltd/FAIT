import { createClient } from '@supabase/supabase-js';

// Create a Supabase client
export const createSupabaseClient = (supabaseUrl: string, supabaseKey: string) => {
  return createClient(supabaseUrl, supabaseKey);
};

// Export a default client that uses environment variables
export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Add more authentication utilities as needed
