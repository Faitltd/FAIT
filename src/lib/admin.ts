import { supabase } from './supabase';

// Helper function to check if user has admin role
export const isAdmin = async () => {
  try {
    // First check if we're using local auth
    const isLocalAuth = localStorage.getItem('useLocalAuth') === 'true';

    if (isLocalAuth) {
      // Check local session
      const localSession = localStorage.getItem('localAuthSession');
      if (!localSession) return false;

      try {
        const parsedSession = JSON.parse(localSession);
        const user = parsedSession.user;

        // Check user_type in user_metadata
        if (user?.user_metadata?.user_type === 'admin') {
          return true;
        }

        // Check email as fallback
        if (user?.email?.includes('admin')) {
          return true;
        }

        return false;
      } catch (err) {
        console.error('Error parsing local session:', err);
        return false;
      }
    } else {
      // Use Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // First check user metadata
      if (user.user_metadata?.user_type === 'admin') {
        return true;
      }

      // Then try to check via profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (!profileError && profileData && profileData.user_type === 'admin') {
        return true;
      }

      return false;
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};