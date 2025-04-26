import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { toggleAuthMode, isUsingLocalAuth } from '../lib/supabase';

const EnhancedTestLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [usingLocalAuth, setUsingLocalAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we're using local auth
    setUsingLocalAuth(isUsingLocalAuth());
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Check for hardcoded test accounts first
      if (email === 'admin@itsfait.com' && (password === 'password' || password === 'admin123')) {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userType', 'admin');
        setMessage('Login successful as admin!');
        setTimeout(() => navigate('/subscription/dashboard'), 1000);
        return;
      } else if (email === 'client@itsfait.com' && (password === 'password' || password === 'admin123')) {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userType', 'client');
        setMessage('Login successful as client!');
        setTimeout(() => navigate('/subscription/dashboard'), 1000);
        return;
      } else if (email === 'service@itsfait.com' && (password === 'password' || password === 'admin123')) {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userType', 'service_agent');
        setMessage('Login successful as service agent!');
        setTimeout(() => navigate('/subscription/dashboard'), 1000);
        return;
      }

      if (usingLocalAuth) {
        // For any other email, if password is 'password' or 'admin123', create a client account
        if (password === 'password' || password === 'admin123') {
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userType', 'client');
          setMessage('Login successful as client!');
          setTimeout(() => navigate('/subscription/dashboard'), 1000);
          return;
        } else {
          throw new Error('Invalid credentials. For test accounts, use password "password" or "admin123"');
        }
      } else {
        // Using real Supabase auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        setMessage('Login successful!');

        // Redirect to subscription dashboard
        setTimeout(() => {
          navigate('/subscription/dashboard');
        }, 1000);
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyLogin = async (userType: string) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Enable local auth mode
      toggleAuthMode(true);
      setUsingLocalAuth(true);

      // Use predefined test accounts
      let testEmail = '';

      switch (userType) {
        case 'admin':
          testEmail = 'admin@itsfait.com';
          break;
        case 'service_agent':
          testEmail = 'service@itsfait.com';
          break;
        case 'client':
        default:
          testEmail = 'client@itsfait.com';
          break;
      }

      // Skip the actual authentication and directly set the user data
      // This is a workaround for the login issues
      localStorage.setItem('userType', userType);
      localStorage.setItem('userEmail', testEmail);

      setMessage(`Logged in as ${userType}`);
      console.log(`Emergency login successful: ${userType} (${testEmail})`);

      // Redirect to subscription dashboard
      setTimeout(() => {
        navigate('/subscription/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Error during emergency login:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
    <div className="bg-gradient-to-b from-blue-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Test Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Use this page to test the platform with different user roles
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{message}</p>
                </div>
              </div>
            </div>
          )}

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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Quick Access Options {usingLocalAuth ? '(Using Local Auth)' : '(Using Supabase)'}
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <button
                onClick={() => {
                  const newMode = !usingLocalAuth;
                  toggleAuthMode(newMode);
                  setUsingLocalAuth(newMode);
                  setMessage(newMode ? 'Switched to local authentication' : 'Switched to Supabase authentication');
                }}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {usingLocalAuth ? 'Use Supabase Auth' : 'Use Local Auth'}
              </button>
            </div>

            <div className="mt-6">
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
                <p className="font-medium">Test Account Credentials</p>
                <ul className="mt-2 list-disc list-inside">
                  <li><strong>Admin:</strong> admin@itsfait.com / password or admin123</li>
                  <li><strong>Client:</strong> client@itsfait.com / password or admin123</li>
                  <li><strong>Service Agent:</strong> service@itsfait.com / password or admin123</li>
                </ul>
                <p className="mt-2">Or use any email with password "password" or "admin123"</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <button
                    onClick={() => handleEmergencyLogin('client')}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Login as Client
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => handleEmergencyLogin('service_agent')}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Login as Service Agent
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => handleEmergencyLogin('admin')}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Login as Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow sm:rounded-lg sm:px-10">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Home
            </a>
            <a
              href="/dashboard/client"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Client Dashboard
            </a>
            <a
              href="/dashboard/service-agent"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Service Agent Dashboard
            </a>
            <a
              href="/debug"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Debug Page
            </a>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default EnhancedTestLogin;
