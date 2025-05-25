import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/UnifiedAuthContext';

const UnifiedLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isLocalAuth, userType } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Add debug info about auth mode
  useEffect(() => {
    setDebugInfo([`Using ${isLocalAuth ? 'local' : 'Supabase'} authentication`]);
  }, [isLocalAuth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDebugInfo(prev => [...prev, `Login attempt started at ${new Date().toISOString()}`]);

    if (!email || !password) {
      setError('Please enter both email and password');
      setDebugInfo(prev => [...prev, 'Error: Missing email or password']);
      return;
    }

    setLoading(true);
    setDebugInfo(prev => [...prev, `Attempting login with email: ${email}`]);

    try {
      const { data, error: loginError } = await signIn(email, password);

      if (loginError) {
        setDebugInfo(prev => [...prev, `Login error: ${loginError.message}`]);
        throw loginError;
      }

      if (data) {
        setDebugInfo(prev => [...prev, 'Login successful']);

        // Determine the appropriate dashboard based on user type
        const getDashboardPath = () => {
          // Get the from path from location state if available
          const fromPath = (location.state as any)?.from;
          if (fromPath) return fromPath;

          // Check user metadata for user type
          const userData = data.user || {};
          const userMetadata = userData.user_metadata || {};
          const email = userData.email || '';

          // Determine user type
          let userRole = userMetadata.user_type;
          if (!userRole) {
            if (email.includes('admin')) {
              userRole = 'admin';
            } else if (email.includes('service')) {
              userRole = 'service_agent';
            } else {
              userRole = 'client';
            }
          }

          // Return appropriate dashboard path
          switch (userRole) {
            case 'admin':
              return '/dashboard/admin';
            case 'service_agent':
              return '/dashboard/service-agent';
            case 'client':
            default:
              return '/dashboard/client';
          }
        };

        const dashboardPath = getDashboardPath();
        setDebugInfo(prev => [...prev, `Redirecting to: ${dashboardPath}`]);

        // Redirect immediately without showing success message
        navigate(dashboardPath);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/logo.png"
          alt="FAIT Co-op"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Auth mode indicator */}
          <div className="mb-4 text-center text-sm text-gray-500">
            Using {isLocalAuth ? 'Local' : 'Supabase'} Authentication
          </div>

          {/* We've removed the success message since we're redirecting immediately */}

          {/* Error message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Login form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          {/* Debug information in development mode */}
          {import.meta.env.MODE === 'development' && (
            <div className="mt-6 p-3 bg-gray-50 rounded-md text-xs">
              <details>
                <summary className="cursor-pointer text-gray-500 font-medium">Debug Information</summary>
                <div className="mt-2 space-y-1 text-gray-600">
                  {debugInfo.map((info, index) => (
                    <div key={index}>{info}</div>
                  ))}
                </div>
              </details>
            </div>
          )}

          {/* Test credentials in development mode */}
          {import.meta.env.MODE === 'development' && isLocalAuth && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md text-xs">
              <details>
                <summary className="cursor-pointer text-blue-500 font-medium">Test Credentials</summary>
                <div className="mt-2 space-y-1 text-gray-600">
                  <div>Admin: admin@itsfait.com / admin123</div>
                  <div>Client: client@itsfait.com / client123</div>
                  <div>Service Agent: service@itsfait.com / service123</div>
                </div>
              </details>
            </div>
          )}

          {/* Alternative login methods */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Having trouble signing in?</p>
            <Link
              to="/direct-login"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Use Direct Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLoginPage;
