import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AdminBypassLogin - A special login page for admin access that bypasses Supabase
 * This is a temporary solution until the admin login issues are fixed
 */
const AdminBypassLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // The master password for admin access
  const MASTER_PASSWORD = 'admin123';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Check if password matches
      if (password !== MASTER_PASSWORD) {
        throw new Error('Invalid password');
      }

      // Store admin info in localStorage
      localStorage.setItem('adminBypass', JSON.stringify({
        email: 'admin@itsfait.com',
        userType: 'admin',
        isAdminUser: true,
        isAdminBypass: true,
        userId: 'admin-bypass-id',
        timestamp: new Date().toISOString()
      }));

      // Also set regular auth info for compatibility with other parts of the app
      localStorage.setItem('userType', 'admin');
      localStorage.setItem('userEmail', 'admin@itsfait.com');
      localStorage.setItem('isAdminUser', 'true');

      // Show success message
      setSuccess(true);

      // Redirect to admin dashboard
      setTimeout(() => {
        navigate('/dashboard/admin');
      }, 1500);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Bypass Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This is a special login page for admin access that bypasses Supabase.
            <br />
            Use this page if the regular admin login is not working.
          </p>
        </div>

        {success ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Admin access granted</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Redirecting to admin dashboard...</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="password" className="sr-only">Admin Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Admin Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Login failed</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {loading ? 'Signing in...' : 'Sign in as Admin'}
              </button>
            </div>

            <div className="text-sm text-center">
              <p className="font-medium text-indigo-600">
                Admin Password: admin123
              </p>
              <p className="mt-2 text-gray-500">
                This bypass login stores admin credentials in localStorage and does not interact with Supabase.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminBypassLogin;
