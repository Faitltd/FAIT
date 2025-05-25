/**
 * LoginForm Component
 * 
 * This component provides a form for user login.
 */

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectTo?: string;
  showOAuthButtons?: boolean;
  showForgotPassword?: boolean;
  showRegisterLink?: boolean;
  registerUrl?: string;
  forgotPasswordUrl?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  redirectTo,
  showOAuthButtons = true,
  showForgotPassword = true,
  showRegisterLink = true,
  registerUrl = '/register',
  forgotPasswordUrl = '/forgot-password'
}) => {
  const { signIn, signInWithGoogle, signInWithFacebook, isLocalAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        throw signInError;
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (redirectTo) {
        window.location.href = redirectTo;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
      
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const { error: signInError } = await signInWithGoogle();
      
      if (signInError) {
        throw signInError;
      }
      
      // For local auth, success callback will be called immediately
      // For Supabase auth, user will be redirected to Google
      if (isLocalAuth && onSuccess) {
        onSuccess();
      }
      
      if (isLocalAuth && redirectTo) {
        window.location.href = redirectTo;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during Google login';
      setError(errorMessage);
      
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const { error: signInError } = await signInWithFacebook();
      
      if (signInError) {
        throw signInError;
      }
      
      // For local auth, success callback will be called immediately
      // For Supabase auth, user will be redirected to Facebook
      if (isLocalAuth && onSuccess) {
        onSuccess();
      }
      
      if (isLocalAuth && redirectTo) {
        window.location.href = redirectTo;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during Facebook login';
      setError(errorMessage);
      
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Email"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Password"
            required
          />
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
        
        {showForgotPassword && (
          <div className="text-center mb-4">
            <a
              href={forgotPasswordUrl}
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            >
              Forgot Password?
            </a>
          </div>
        )}
        
        {showRegisterLink && (
          <div className="text-center mb-4">
            <span className="text-sm">Don't have an account? </span>
            <a
              href={registerUrl}
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            >
              Register
            </a>
          </div>
        )}
        
        {showOAuthButtons && !isLocalAuth && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={handleFacebookSignIn}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span>Facebook</span>
              </button>
            </div>
          </div>
        )}
        
        {isLocalAuth && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-yellow-800">
              Using local authentication mode for development. 
              <br />
              Try these test credentials:
              <br />
              - Admin: admin@itsfait.com / admin123
              <br />
              - Client: client@itsfait.com / client123
              <br />
              - Service: service@itsfait.com / service123
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginForm;
