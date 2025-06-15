import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/UnifiedAuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, LogIn, Github, Facebook } from 'lucide-react';

interface EnhancedLoginFormProps {
  redirectTo?: string;
}

const EnhancedLoginForm: React.FC<EnhancedLoginFormProps> = ({ redirectTo = '/' }) => {
  const navigate = useNavigate();
  const { signIn, signInWithGithub, signInWithGoogle } = useAuth();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };
  
  // Form validation
  const validateForm = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    
    if (!password) {
      setError('Password is required');
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setError(null);
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const { error } = await signIn({ email, password });
      
      if (error) throw error;
      
      navigate(redirectTo);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle social login
  const handleSocialLogin = async (provider: 'github' | 'google') => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = provider === 'github'
        ? await signInWithGithub()
        : await signInWithGoogle();
      
      if (error) throw error;
      
      navigate(redirectTo);
    } catch (err) {
      console.error(`${provider} login error:`, err);
      setError(err instanceof Error ? err.message : `Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.div
      className="max-w-md w-full mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="px-6 py-8 sm:px-10">
        <div className="text-center mb-8">
          <motion.h2
            className="text-3xl font-extrabold text-gray-900"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Welcome Back
          </motion.h2>
          <motion.p
            className="mt-2 text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Sign in to your account to continue
          </motion.p>
        </div>
        
        {/* Social Login Buttons */}
        <motion.div
          className="flex flex-col space-y-3 mb-8"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-company-lightpink"
            disabled={loading}
            variants={itemVariants}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            Continue with Google
          </motion.button>
          
          <motion.button
            type="button"
            onClick={() => handleSocialLogin('github')}
            className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-company-lightpink"
            disabled={loading}
            variants={itemVariants}
          >
            <Github className="h-5 w-5 mr-2" />
            Continue with GitHub
          </motion.button>
        </motion.div>
        
        {/* Divider */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or continue with</span>
          </div>
        </motion.div>
        
        {/* Error Message */}
        {error && (
          <motion.div
            className="mb-6 p-3 rounded-md bg-red-50 border border-red-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </motion.div>
        )}
        
        {/* Login Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Email Field */}
          <motion.div variants={itemVariants}>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`block w-full pl-10 pr-3 py-3 border ${
                  formSubmitted && !email ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-company-lightpink focus:border-company-lightpink sm:text-sm`}
                placeholder="you@example.com"
              />
              {formSubmitted && !email && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {formSubmitted && !email && (
              <p className="mt-1 text-sm text-red-600">Email is required</p>
            )}
          </motion.div>
          
          {/* Password Field */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-company-lightpink hover:text-company-lighterpink"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`block w-full pl-10 pr-10 py-3 border ${
                  formSubmitted && !password ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-company-lightpink focus:border-company-lightpink sm:text-sm`}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {formSubmitted && !password && (
                <div className="absolute inset-y-0 right-10 pr-3 flex items-center pointer-events-none">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {formSubmitted && !password && (
              <p className="mt-1 text-sm text-red-600">Password is required</p>
            )}
          </motion.div>
          
          {/* Submit Button */}
          <motion.div variants={itemVariants}>
            <button
              type="submit"
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-company-lightpink hover:bg-company-lighterpink focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-company-lightpink"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign in
                </div>
              )}
            </button>
          </motion.div>
        </motion.form>
      </div>
      
      {/* Footer */}
      <motion.div
        className="px-6 py-4 bg-gray-50 border-t border-gray-200 sm:px-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <p className="text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-company-lightpink hover:text-company-lighterpink"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedLoginForm;
