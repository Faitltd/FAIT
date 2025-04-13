import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isUsingLocalAuth } from '../lib/supabase';
import { FaGoogle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usingLocalAuth, setUsingLocalAuth] = useState(false);
  const navigate = useNavigate();

  // Check if we're using local auth
  useEffect(() => {
    setUsingLocalAuth(isUsingLocalAuth());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Sign in with email and password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      // Get user profile to determine user type
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', authData.user.id)
        .single();

      // If profile doesn't exist, create one
      if (profileError && profileError.code === 'PGRST116') {
        console.log('Profile not found, creating a new one');

        // Get user metadata from auth
        const { data: userData } = await supabase.auth.getUser();
        const userMeta = userData?.user?.user_metadata;

        // Default to client if no user type in metadata
        const userType = userMeta?.user_type || 'client';
        const fullName = userMeta?.full_name || userMeta?.name || email.split('@')[0];

        // Create profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            user_type: userType,
            full_name: fullName,
            email: email,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
          throw new Error('Failed to create user profile. Please contact support.');
        }

        // Navigate based on created user type
        if (userType === 'service_agent') {
          navigate('/dashboard/service-agent');
        } else {
          navigate('/dashboard/client');
        }
        return;
      } else if (profileError) {
        // Handle other profile errors
        throw profileError;
      }

      // Navigate based on user type
      if (profileData.user_type === 'service_agent') {
        navigate('/dashboard/service-agent');
      } else if (profileData.user_type === 'client') {
        navigate('/dashboard/client');
      } else if (profileData.user_type === 'admin') {
        navigate('/dashboard/admin');
      } else {
        // Default fallback
        navigate('/dashboard/client');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!GOOGLE_CLIENT_ID) {
        throw new Error('Google Client ID is not configured');
      }

      console.log('Starting Google OAuth flow...');
      console.log('Redirect URL:', `${window.location.origin}/oauth-callback`);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/oauth-callback`,
          queryParams: {
            client_id: GOOGLE_CLIENT_ID,
            prompt: 'select_account' // Force Google to show account selection
          }
        }
      });

      if (error) {
        console.error('OAuth initialization error:', error);
        throw error;
      }

      if (data && data.url) {
        console.log('OAuth URL generated successfully');
        console.log('Redirecting to:', data.url);
        // Redirect manually to ensure it works
        window.location.href = data.url;
      } else {
        throw new Error('No OAuth URL returned from Supabase');
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>

          {usingLocalAuth && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800 flex items-start">
              <FaInfoCircle className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Using Local Authentication Mode</p>
                <p className="mt-1">You can use any of these test accounts:</p>
                <ul className="mt-1 list-disc list-inside">
                  <li><strong>Admin:</strong> admin@itsfait.com / password</li>
                  <li><strong>Client:</strong> client@itsfait.com / password</li>
                  <li><strong>Service Agent:</strong> service@itsfait.com / password</li>
                </ul>
                <p className="mt-1">Or use any email with password "password"</p>
              </div>
            </div>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          <div className="mt-4 space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
              </svg>
              Sign in with Google
            </button>

            {error && error.includes('OAuth') && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                <div className="flex items-center mb-2">
                  <FaExclamationTriangle className="text-yellow-600 mr-2" />
                  <span className="font-medium">OAuth login is having issues</span>
                </div>
                <p>If you're having trouble with Google login, try the direct login method below.</p>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or use direct login</span>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                to="/direct-login"
                className="w-full flex justify-center py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Direct Login (Bypass OAuth)
              </Link>

              <Link
                to="/emergency-login"
                className="w-full flex justify-center py-2 px-4 border border-red-600 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Emergency Login (No Database)
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
