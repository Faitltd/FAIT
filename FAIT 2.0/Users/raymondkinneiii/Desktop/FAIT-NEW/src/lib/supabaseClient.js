import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials for development
const supabaseUrl = 'https://sjrehyseqqptdcnadvod.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcmVoeXNlcXFwdGRjbmFkdm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzMxMzcsImV4cCI6MjA1OTAwOTEzN30.fPyawZcgteRLZUH0MvtVSmNmZSdbxUOyN9lo6BDe8-8';

console.log('Creating Supabase client with URL:', supabaseUrl);
console.log('Anon key length:', supabaseAnonKey.length);

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log the Supabase client structure
console.log('Supabase client created');
console.log('Supabase auth methods:', Object.keys(supabase.auth));
console.log('signInWithPassword type:', typeof supabase.auth.signInWithPassword);

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error);
  } else {
    console.log('Supabase connection successful, session:', data.session ? 'Active' : 'None');
  }
});
