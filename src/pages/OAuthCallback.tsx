import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { handleAuthError, AuthErrorCategory } from '../utils/authErrorHandler';

const OAuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('OAuth callback initiated');
        console.log('URL search params:', location.search);

        // Check if we have an access_token or code in the URL
        const params = new URLSearchParams(location.search);
        const hasCode = params.has('code');
        const hasAccessToken = params.has('access_token');

        console.log('Has code:', hasCode);
        console.log('Has access_token:', hasAccessToken);

        // If we have a code, we need to exchange it for a session
        if (hasCode) {
          console.log('Exchanging code for session...');
          // Supabase should handle this automatically when we call getSession()
        }

        // Get session from URL (Supabase handles this automatically)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        // Store debug info
        setDebugInfo({
          hasCode,
          hasAccessToken,
          sessionError: sessionError ? sessionError.message : null,
          hasSession: !!session,
          userData: session?.user ? {
            id: session.user.id,
            email: session.user.email,
            hasMeta: !!session.user.user_metadata
          } : null
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (!session) {
          console.error('No session found after OAuth callback');
          throw new Error('No session found. The authentication process did not complete successfully.');
        }

        console.log('Session obtained successfully:', session.user.id);

        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist - create a basic one
          console.log('Profile not found for OAuth user, creating a new one');

          // Get user info from session
          const userMeta = session.user.user_metadata;
          const email = session.user.email || '';
          const fullName = userMeta?.full_name || userMeta?.name || email.split('@')[0];

          // Create profile with default client type
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              user_type: 'client',  // Default to client for OAuth users
              full_name: fullName,
              email: email,
              created_at: new Date().toISOString()
            });

          if (insertError) {
            console.error('Error creating profile:', insertError);
            throw new Error('Failed to create user profile. Please contact support.');
          }

          // Redirect to complete profile to let user set preferences
          navigate('/complete-profile');
          return;
        } else if (profileError) {
          throw profileError;
        }

        if (profile) {
          // Existing user - redirect to dashboard
          navigate(profile.user_type === 'service_agent' ? '/dashboard/service-agent' : '/dashboard/client');
        } else {
          // This shouldn't happen, but just in case
          navigate('/complete-profile');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        const formattedError = handleAuthError(err instanceof Error ? err : new Error('Authentication failed'));

        // Add more detailed error information for OAuth errors
        if (formattedError.category === AuthErrorCategory.OAUTH) {
          setDebugInfo({
            ...debugInfo,
            errorDetails: formattedError.details,
            errorCategory: formattedError.category,
            errorCode: formattedError.code
          });
        }

        setError(formattedError.message);
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Completing sign in...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-md max-w-md w-full">
          <h3 className="text-lg font-medium">Authentication Error</h3>
          <p className="mt-2">{error}</p>

          {debugInfo && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-700 font-mono overflow-auto">
              <h4 className="font-medium mb-1">Debug Information:</h4>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            <p>Possible solutions:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Try signing in again</li>
              <li>Clear your browser cookies and cache</li>
              <li>Check if third-party cookies are enabled</li>
              <li>Try using a different browser</li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthCallback;