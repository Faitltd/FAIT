import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/UserRoles';
import { generateUUID } from '../../utils/uuid';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDevelopment, setIsDevelopment] = useState(false);
  const [devModeEnabled, setDevModeEnabled] = useState(false);

  // Check if we're in development mode
  useEffect(() => {
    const mode = import.meta.env.MODE;
    setIsDevelopment(mode === 'development');

    // Check if dev mode login is enabled in localStorage
    // Default to true in development mode for easier testing
    const devMode = localStorage.getItem('devModeLogin');
    if (devMode === null && mode === 'development') {
      // If not set yet and we're in development, default to true
      localStorage.setItem('devModeLogin', 'true');
      setDevModeEnabled(true);
    } else {
      setDevModeEnabled(devMode === 'true');
    }

    console.log('Environment mode:', mode);
    console.log('Development mode login enabled:', devMode === 'true' || (devMode === null && mode === 'development'));
  }, []);

  const toggleDevMode = () => {
    const newValue = !devModeEnabled;
    setDevModeEnabled(newValue);
    localStorage.setItem('devModeLogin', newValue.toString());
    console.log('Development mode login ' + (newValue ? 'enabled' : 'disabled'));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if dev mode is enabled
      const currentDevMode = localStorage.getItem('devModeLogin') === 'true';

      // In development mode with dev login enabled, bypass authentication
      if (isDevelopment && currentDevMode) {
        console.log('Development mode: Bypassing authentication');

        // Simulate a delay for more realistic behavior
        await new Promise(resolve => setTimeout(resolve, 500));

        // Determine user role based on email (for demo purposes)
        let userRole = UserRole.CLIENT;
        if (email.includes('admin')) {
          userRole = UserRole.ADMIN;
        } else if (email.includes('contractor')) {
          userRole = UserRole.CONTRACTOR;
        } else if (email.includes('ally')) {
          userRole = UserRole.ALLY;
        }

        // Store user info in localStorage for the app to use
        // Generate a proper UUID for compatibility with Supabase
        const userId = generateUUID();
        localStorage.setItem('devUser', JSON.stringify({
          id: userId,
          email,
          user_role: userRole,
          created_at: new Date().toISOString()
        }));

        console.log('Development mode: Created user with UUID:', userId);

        console.log(`Development login successful as ${userRole}`);

        // Redirect to dashboard
        navigate('/dashboard');
        return;
      }

      // Normal authentication flow
      console.log('Using normal authentication flow');
      const { error: signInError } = await login(email, password);

      if (signInError) {
        throw signInError;
      }

      // If login is successful, navigate to dashboard
      navigate('/dashboard');

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          {/* Development Mode Toggle */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">Development Mode</div>
              <button
                type="button"
                onClick={toggleDevMode}
                className={`${
                  devModeEnabled ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span className="sr-only">Toggle Development Mode</span>
                <span
                  className={`${
                    devModeEnabled ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                >
                </span>
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {devModeEnabled
                ? 'Development mode is enabled. Authentication will be bypassed.'
                : 'Development mode is disabled. Normal authentication will be used.'}
            </p>
            {devModeEnabled && (
              <div className="mt-2 text-xs text-gray-500">
                <p>Use these email patterns for different roles:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li><strong>admin@example.com</strong> - Admin role</li>
                  <li><strong>contractor@example.com</strong> - Contractor role</li>
                  <li><strong>ally@example.com</strong> - Ally role</li>
                  <li><strong>any other email</strong> - Client role</li>
                </ul>
                <p className="mt-1">Password can be anything in dev mode.</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <button
                  type="button"
                  onClick={() => setEmail('client@example.com')}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Client Demo
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setEmail('contractor@example.com')}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Contractor Demo
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setEmail('admin@example.com')}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Admin Demo
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setEmail('ally@example.com')}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Ally Demo
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
