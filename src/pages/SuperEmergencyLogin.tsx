import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';

const SuperEmergencyLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Hardcoded test accounts for super emergency login
      if (email === 'admin@itsfait.com' && password === 'admin123') {
        // Store user info in localStorage
        localStorage.setItem('localAuthSession', JSON.stringify({
          user: {
            id: 'admin-uuid',
            email: email,
            user_metadata: {
              full_name: 'Admin User',
              user_type: 'admin'
            },
            app_metadata: {},
            created_at: new Date().toISOString()
          },
          access_token: `super-emergency-token-${Date.now()}`,
          refresh_token: `super-emergency-refresh-${Date.now()}`,
          expires_at: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        }));
        
        // Force local auth mode
        localStorage.setItem('useLocalAuth', 'true');
        
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/dashboard/admin';
        }, 1000);
        return;
      } else if (email === 'client@itsfait.com' && password === 'client123') {
        // Store user info in localStorage
        localStorage.setItem('localAuthSession', JSON.stringify({
          user: {
            id: 'client-uuid',
            email: email,
            user_metadata: {
              full_name: 'Client User',
              user_type: 'client'
            },
            app_metadata: {},
            created_at: new Date().toISOString()
          },
          access_token: `super-emergency-token-${Date.now()}`,
          refresh_token: `super-emergency-refresh-${Date.now()}`,
          expires_at: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        }));
        
        // Force local auth mode
        localStorage.setItem('useLocalAuth', 'true');
        
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/dashboard/client';
        }, 1000);
        return;
      } else if (email === 'service@itsfait.com' && password === 'service123') {
        // Store user info in localStorage
        localStorage.setItem('localAuthSession', JSON.stringify({
          user: {
            id: 'service-uuid',
            email: email,
            user_metadata: {
              full_name: 'Service Agent User',
              user_type: 'service_agent'
            },
            app_metadata: {},
            created_at: new Date().toISOString()
          },
          access_token: `super-emergency-token-${Date.now()}`,
          refresh_token: `super-emergency-refresh-${Date.now()}`,
          expires_at: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        }));
        
        // Force local auth mode
        localStorage.setItem('useLocalAuth', 'true');
        
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/dashboard/service-agent';
        }, 1000);
        return;
      }

      // If we get here, credentials were invalid
      setError('Invalid email or password');
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
            <Link to="/emergency-login" className="flex items-center text-sm text-blue-600 hover:text-blue-500">
              <ArrowLeft className="mr-1" size={16} /> Back to emergency login
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Super Emergency Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Last resort login method - bypasses all authentication systems
          </p>
          <div className="mt-2 text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Completely Offline Mode
            </span>
          </div>
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

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-800 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Super Emergency Sign In'}
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Need help?</p>
            <a href="mailto:support@itsfait.com" className="font-medium text-blue-600 hover:text-blue-500">
              Contact Support
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuperEmergencyLogin;
