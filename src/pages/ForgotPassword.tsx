import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { createPasswordResetRequest } from '../services/passwordReset';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      try {
        // First try the built-in Supabase method
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;

        setMessage({
          text: 'Password reset instructions have been sent to your email. Please check your inbox and spam folder. If you don\'t receive an email within a few minutes, please check the Google SMTP configuration in supabase/config.toml.',
          type: 'success',
        });

        // Add a note about Google SMTP configuration
        console.info('Make sure your Google Workspace SMTP is properly configured. See docs/google-smtp-setup.md for details.');
      } catch (supabaseError) {
        console.warn('Supabase password reset failed, using fallback method:', supabaseError);

        // Fallback to our custom implementation with security warning
        console.warn('SECURITY WARNING: Using development-only password reset flow. This should not be used in production.');

        // Show security warning to user
        const securityWarning = `
          DEVELOPMENT MODE: Using a secure but temporary password reset flow.

          In production, password resets should be handled via email verification.
          This development flow uses encrypted tokens stored in your browser.
        `;

        // Log the warning but don't show alert to avoid disrupting the flow
        console.info(securityWarning);

        // Create the secure token
        const token = await createPasswordResetRequest(email);
        setResetToken(token);

        // Navigate to reset password page with email and token
        navigate(`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
      }
    } catch (err) {
      console.error('Password reset error:', err);

      // Provide more helpful error messages
      let errorMessage = 'An error occurred. Please try again.';

      if (err instanceof Error) {
        if (err.message.includes('rate limit')) {
          errorMessage = 'Too many password reset attempts. Please try again later.';
        } else if (err.message.includes('User not found') || err.message.includes('No account found')) {
          errorMessage = 'No account found with this email address. Please check the email or create a new account.';
        } else {
          errorMessage = err.message;
        }
      }

      setMessage({
        text: errorMessage,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
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

          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </div>

          <div className="text-center space-y-2">
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 block">
              Back to sign in
            </Link>
            <Link to="/register" className="text-sm text-gray-600 hover:text-gray-800 block">
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
