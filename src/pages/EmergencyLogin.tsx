import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Hardcoded credentials for emergency access
// In a real application, these would be stored securely and not in the code
const EMERGENCY_CREDENTIALS = [
  { email: 'admin@itsfait.com', password: 'admin123', userType: 'admin' },
  { email: 'client@itsfait.com', password: 'client123', userType: 'client' },
  { email: 'service@itsfait.com', password: 'service123', userType: 'service_agent' }
];

const EmergencyLogin = () => {
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
      // Simple validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Check against hardcoded credentials
      const user = EMERGENCY_CREDENTIALS.find(
        (cred) => cred.email.toLowerCase() === email.toLowerCase() && cred.password === password
      );

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Store user info in localStorage (this is not secure, but it's for emergency use only)
      localStorage.setItem('emergency_auth', JSON.stringify({
        email: user.email,
        userType: user.userType,
        isEmergencyLogin: true
      }));

      // Show success message
      setSuccess(true);
      
      // Redirect based on user type
      setTimeout(() => {
        if (user.userType === 'admin') {
          navigate('/dashboard/admin');
        } else if (user.userType === 'service_agent') {
          navigate('/dashboard/service-agent');
        } else {
          navigate('/dashboard/client');
        }
      }, 1000);
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
              ← Back to login options
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Emergency Login
          </h2>
          <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-center text-sm text-yellow-800">
              Use this method only when Supabase authentication is completely broken.
              <br />
              <span className="font-medium">This bypasses the database entirely.</span>
            </p>
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Emergency Sign In'}
            </button>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Available test accounts:</p>
            <ul className="mt-2 space-y-1 text-left bg-gray-50 p-3 rounded-md">
              <li><span className="font-medium">Admin:</span> admin@itsfait.com / admin123</li>
              <li><span className="font-medium">Client:</span> client@itsfait.com / client123</li>
              <li><span className="font-medium">Service Agent:</span> service@itsfait.com / service123</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmergencyLogin;
