import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isUsingLocalAuth } from '../../lib/supabase';
import DevelopmentModeToggle from './DevelopmentModeToggle';
import OAuthButtons from './OAuthButtons';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, userType, isLocalAuth, isDevelopmentMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showDevOptions, setShowDevOptions] = useState(false);

  // Pre-fill test credentials in development mode
  useEffect(() => {
    if (isDevelopmentMode) {
      // Auto-fill credentials for testing when in development mode
      setEmail('admin@itsfait.com');
      setPassword('admin123');
    }
  }, [isDevelopmentMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setDebugInfo([`Login attempt started at ${new Date().toISOString()}`]);

    if (!email || !password) {
      setError('Please enter both email and password');
      setDebugInfo(prev => [...prev, 'Error: Missing email or password']);
      return;
    }

    setLoading(true);
    setDebugInfo(prev => [...prev, `Using auth mode: ${isLocalAuth ? 'Local' : 'Supabase'}`]);

    try {
      setDebugInfo(prev => [...prev, `Attempting login with email: ${email}`]);
      const { data, error: loginError } = await signIn(email, password);

      if (loginError) {
        setDebugInfo(prev => [...prev, `Login error: ${loginError.message}`]);
        throw loginError;
      }

      if (data?.user) {
        // Show success message
        setSuccessMessage(`Login successful! Redirecting to dashboard...`);

        // Add debug info
        setDebugInfo(prev => [
          ...prev,
          `Login successful for user: ${data.user.email}`,
          `User ID: ${data.user.id}`,
          `User type: ${userType || 'unknown'}`
        ]);

        // Log the user type for debugging
        console.log(`Login successful for user type: ${userType}`);

        // Short delay before redirect for better UX
        setTimeout(() => {
          // Redirect to dashboard
          navigate('/dashboard');
        }, 1000);
      } else {
        setDebugInfo(prev => [...prev, 'No user data returned from login']);
      }
    } catch (err) {
      console.error('Error logging in:', err);
      setError(err instanceof Error ? err.message : 'Invalid email or password');
      setDebugInfo(prev => [...prev, `Login exception: ${err instanceof Error ? err.message : String(err)}`]);
    } finally {
      setLoading(false);
      setDebugInfo(prev => [...prev, `Login attempt completed at ${new Date().toISOString()}`]);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Log In</h2>

      {isLocalAuth && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <p className="text-yellow-700">Using local authentication mode</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            data-cy="login-email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            data-cy="login-password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="mt-1 text-right">
            <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>
        </div>

        <button
          type="submit"
          data-cy="login-submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </form>

      {/* OAuth login buttons */}
      <div className="mt-6">
        <OAuthButtons
          onSuccess={() => {
            setSuccessMessage('OAuth login successful! Redirecting...');
            setTimeout(() => navigate('/dashboard'), 1000);
          }}
          onError={(error) => setError(error.message)}
        />
      </div>

      {/* Development mode toggle */}
      <div className="mt-6">
        <button
          type="button"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
          onClick={() => setShowDevOptions(!showDevOptions)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 mr-1 transition-transform ${showDevOptions ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Developer Options
        </button>

        {showDevOptions && (
          <div className="mt-2">
            <DevelopmentModeToggle />
          </div>
        )}
      </div>

      {/* Debug log section - only visible in development mode */}
      {isDevelopmentMode && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium text-gray-700 mb-2">Debug Info:</h3>
          <p className="text-sm text-gray-600">
            Auth Mode: <span className="font-mono">{isLocalAuth ? 'Local' : 'Supabase'}</span>
          </p>
          {debugInfo.length > 0 && (
            <div className="mt-2">
              <h4 className="text-xs font-medium text-gray-700 mb-1">Log:</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded-md overflow-auto max-h-40">
                {debugInfo.map((info, i) => (
                  <div key={i} className="font-mono">{info}</div>
                ))}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
