import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isUsingLocalAuth } from '../lib/supabase';
import { FaArrowLeft } from 'react-icons/fa';

const DirectLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
      // For local development, use test accounts
      if (usingLocalAuth) {
        // Hardcoded test accounts for local development
        if (email === 'admin@itsfait.com' && password === 'password') {
          localStorage.setItem('userEmail', email);
          setSuccess(true);
          setTimeout(() => navigate('/dashboard/admin'), 1000);
          return;
        } else if (email === 'client@itsfait.com' && password === 'password') {
          localStorage.setItem('userEmail', email);
          setSuccess(true);
          setTimeout(() => navigate('/dashboard/client'), 1000);
          return;
        } else if (email === 'service@itsfait.com' && password === 'password') {
          localStorage.setItem('userEmail', email);
          setSuccess(true);
          setTimeout(() => navigate('/dashboard/service-agent'), 1000);
          return;
        }
      }

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
        throw profileError;
      }

      // Navigate based on user type
      if (profileData) {
        setSuccess(true);
        setTimeout(() => {
          if (profileData.user_type === 'service_agent') {
            navigate('/dashboard/service-agent');
          } else {
            navigate('/dashboard/client');
          }
        }, 1000);
      } else {
        navigate('/complete-profile');
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
          <div className="flex items-center justify-between">
            <Link to="/login" className="flex items-center text-sm text-blue-600 hover:text-blue-500">
              <FaArrowLeft className="mr-1" /> Back to login options
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Direct Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use this method if OAuth login is not working
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
              Login successful! Redirecting to dashboard...
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

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Still having issues?</p>
            <Link
              to="/emergency-login"
              className="w-full flex justify-center py-2 px-4 border border-red-600 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Emergency Login (No Database)
            </Link>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Don't have an account?</p>
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Create a new account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DirectLogin;
