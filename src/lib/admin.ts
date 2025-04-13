import { supabase } from './supabase';

// Helper function to check if user has admin role
export const isAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  try {
    // First try to check via profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (!profileError && profileData && profileData.user_type === 'admin') {
      return true;
    }

    // We'll skip checking admin_users table for now as it might not exist
    // If we need to check it in the future, we can add it back

    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};