import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isUsingLocalAuth } from '../lib/supabase';
import { FaInfoCircle } from 'react-icons/fa';

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

    // Trim email to prevent whitespace issues
    const trimmedEmail = email.trim();

    try {
      console.log('Attempting login with:', { email: trimmedEmail, password, usingLocalAuth });

      // Use a simpler approach for login
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      console.log('Login successful');

      // Get the current session to determine user type
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        throw new Error('No user data returned after login');
      }

      console.log('Session data:', sessionData);

      // For local auth, we can determine the user type from the session
      if (usingLocalAuth) {
        // Get user type from the user object
        const userType = user.user_type || user.user_metadata?.user_type || 'client';

        // Store user type in localStorage for persistence
        localStorage.setItem('userType', userType);
        localStorage.setItem('userEmail', trimmedEmail);

        // Set isAdminUser flag if user is admin
        const isAdminUser = userType === 'admin';
        localStorage.setItem('isAdminUser', isAdminUser.toString());

        console.log('Using local auth, user type:', userType, 'isAdminUser:', isAdminUser);

        // Navigate based on user type
        if (userType === 'service_agent') {
          navigate('/dashboard/service-agent');
        } else if (userType === 'admin') {
          navigate('/dashboard/admin');
        } else {
          navigate('/dashboard/client');
        }
        return;
      }

      // For real Supabase auth, get user profile to determine user type
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      // If profile doesn't exist, create one
      if (profileError && profileError.code === 'PGRST116') {
        console.log('Profile not found, creating a new one');

        // Default to client if no user type in metadata
        const userType = user.user_metadata?.user_type || 'client';
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || trimmedEmail.split('@')[0];

        // Create profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            user_type: userType,
            full_name: fullName,
            email: trimmedEmail,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
          throw new Error('Failed to create user profile. Please contact support.');
        }

        // Store user type in localStorage for persistence
        localStorage.setItem('userType', userType);
        localStorage.setItem('userEmail', trimmedEmail);

        // Set isAdminUser flag if user is admin
        const isAdminUser = userType === 'admin';
        localStorage.setItem('isAdminUser', isAdminUser.toString());

        console.log('Created profile, user type:', userType, 'isAdminUser:', isAdminUser);

        // Navigate based on created user type
        if (userType === 'service_agent') {
          navigate('/dashboard/service-agent');
        } else if (userType === 'admin') {
          navigate('/dashboard/admin');
        } else {
          navigate('/dashboard/client');
        }
        return;
      } else if (profileError) {
        // Handle other profile errors
        console.error('Profile error:', profileError);
        throw profileError;
      }

      // Store user type in localStorage for persistence
      const userType = profileData.user_type;
      localStorage.setItem('userType', userType);
      localStorage.setItem('userEmail', trimmedEmail);

      // Set isAdminUser flag if user is admin
      const isAdminUser = userType === 'admin';
      localStorage.setItem('isAdminUser', isAdminUser.toString());

      console.log('Existing profile, user type:', userType, 'isAdminUser:', isAdminUser);

      // Navigate based on user type
      if (userType === 'service_agent') {
        navigate('/dashboard/service-agent');
      } else if (userType === 'client') {
        navigate('/dashboard/client');
      } else if (userType === 'admin') {
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

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800 flex items-start">
            <FaInfoCircle className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Available Login Credentials</p>
              <ul className="mt-1 list-disc list-inside">
                <li><strong>Admin:</strong> admin@itsfait.com / admin123</li>
                <li><strong>Client:</strong> client@itsfait.com / client123</li>
                <li><strong>Service Agent:</strong> service@itsfait.com / service123</li>
              </ul>
            </div>
          </div>
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
        </form>
      </div>
    </div>
  );
};

export default Login;
