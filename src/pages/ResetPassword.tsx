import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { validateResetToken, resetPassword as resetPasswordWithToken } from '../services/passwordReset';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isCustomFlow, setIsCustomFlow] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is authenticated with a recovery token or has query parameters
  useEffect(() => {
    const checkResetMethod = async () => {
      // Check for query parameters first (our custom flow)
      const params = new URLSearchParams(location.search);
      const emailParam = params.get('email');
      const tokenParam = params.get('token');

      if (emailParam && tokenParam) {
        console.warn('SECURITY NOTICE: Using development-only password reset flow');

        // Validate the token
        const isValid = validateResetToken(emailParam, tokenParam);

        if (isValid) {
          setUserEmail(emailParam);
          setResetToken(tokenParam);
          setIsCustomFlow(true);

          // Add security banner
          console.info(`
            Development Mode: Using secure local password reset flow.
            Email: ${emailParam}
            Token is encrypted and stored locally.
          `);
          return;
        } else {
          setMessage({
            text: 'Invalid or expired reset link. Please request a new password reset.',
            type: 'error',
          });
          return;
        }
      }

      // If no query parameters, check for Supabase session
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Session error:', error);
        setMessage({
          text: 'Invalid or expired recovery link. Please try again.',
          type: 'error',
        });
        return;
      }

      if (data.session?.user) {
        setUserEmail(data.session.user.email);
        setIsCustomFlow(false);
        console.info('Using standard Supabase password reset flow.');
      } else {
        setMessage({
          text: 'No active session found. Please request a new password reset link.',
          type: 'error',
        });
      }
    };

    checkResetMethod();
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validate password
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Validate password confirmation
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (isCustomFlow) {
        // Use our custom password reset flow
        if (!userEmail || !resetToken) {
          throw new Error('Missing email or reset token');
        }

        await resetPasswordWithToken(userEmail, resetToken, password);
      } else {
        // Use Supabase's built-in password reset flow
        const { error } = await supabase.auth.updateUser({
          password: password,
        });

        if (error) throw error;
      }

      setMessage({
        text: 'Your password has been reset successfully!',
        type: 'success',
      });

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      setMessage({
        text: err instanceof Error ? err.message : 'An error occurred. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {isCustomFlow && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Development Mode</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>This is a secure development-only password reset flow. In production, password resets should be handled via email verification.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          {userEmail && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter a new password for <span className="font-medium">{userEmail}</span>
            </p>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && (
            <div
              className={`${
                message.type === 'success' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'
              } px-4 py-3 rounded-md text-sm border`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !userEmail}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
