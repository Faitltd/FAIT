import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

// SVG icons for providers
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

interface OAuthButtonsProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const OAuthButtons: React.FC<OAuthButtonsProps> = ({ onSuccess, onError }) => {
  const { signInWithGoogle, signInWithFacebook, isLocalAuth } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (error) {
      console.error('Google sign in error:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to sign in with Google'));
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      await signInWithFacebook();
      onSuccess?.();
    } catch (error) {
      console.error('Facebook sign in error:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to sign in with Facebook'));
    }
  };

  // Don't show OAuth buttons in local auth mode
  if (isLocalAuth) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          data-cy="google-signin"
        >
          <span className="sr-only">Sign in with Google</span>
          <GoogleIcon />
        </button>

        <button
          type="button"
          onClick={handleFacebookSignIn}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          data-cy="facebook-signin"
        >
          <span className="sr-only">Sign in with Facebook</span>
          <FacebookIcon />
        </button>
      </div>
    </div>
  );
};

export default OAuthButtons;
