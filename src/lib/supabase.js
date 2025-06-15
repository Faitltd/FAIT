import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ydisdyadjupyswcpbxzu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkaXNkeWFkanVweXN3Y3BieHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MzQ4NzQsImV4cCI6MjA1MDIxMDg3NH0.VQlJhYJOQOGWdJJKOGKJOGKJOGKJOGKJOGKJOGKJOGK';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// FAIT-specific helper functions
export const isAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email?.includes('admin@fait.com') || false;
};

export const getFaitProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching FAIT profile:', error);
    return null;
  }
  
  return data;
};
