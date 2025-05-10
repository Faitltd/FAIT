import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/UnifiedAuthContext';
import { directAuthSignIn, getDirectAuthDashboardUrl } from '../lib/directAuth';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';

const DirectLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { isLocalAuth, signIn } = useAuth();
  const navigate = useNavigate();

  // Log for debugging
  useEffect(() => {
    console.log('[DirectLogin] Component mounted, isLocalAuth:', isLocalAuth);
  }, [isLocalAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    console.log('[DirectLogin] Login attempt with:', email);

    try {
      // Try direct auth first (this will work with the test accounts)
      const directAuthResult = directAuthSignIn(email, password);

      if (directAuthResult.success) {
        console.log('[DirectLogin] Direct auth successful');
        setSuccess(true);

        // Get the user type from the result
        const userType = directAuthResult.data?.user?.user_metadata?.user_type;
        const dashboardUrl = getDirectAuthDashboardUrl(userType);

        // Log the redirect
        console.log(`[DirectLogin] Redirecting to ${dashboardUrl}`);

        // Immediate redirect for Cypress tests
        navigate(dashboardUrl);
        return;
      }

      // If direct auth fails, try unified auth
      console.log('[DirectLogin] Direct auth failed, trying unified auth');
      const { data, error: authError } = await signIn(email, password);

      if (authError) {
        throw authError;
      }

      if (!data?.user) {
        throw new Error('No user data returned');
      }

      // Get user type from metadata
      const userType = data.user.user_metadata?.user_type || 'client';
      const dashboardUrl = getDirectAuthDashboardUrl(userType);

      // Set success and redirect immediately
      setSuccess(true);
      console.log(`[DirectLogin] Unified auth successful, redirecting to ${dashboardUrl}`);
      navigate(dashboardUrl);
    } catch (err) {
      console.error('[DirectLogin] Login error:', err);
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
              <ArrowLeft className="mr-1" size={16} /> Back to login options
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
