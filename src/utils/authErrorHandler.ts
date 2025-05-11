/**
 * Authentication Error Handler
 * 
 * This utility provides functions for handling authentication-related errors
 * with user-friendly messages and appropriate logging.
 */

// Define error categories
export enum AuthErrorCategory {
  CREDENTIALS = 'credentials',
  NETWORK = 'network',
  PERMISSION = 'permission',
  VALIDATION = 'validation',
  SESSION = 'session',
  MFA = 'mfa',
  OAUTH = 'oauth',
  UNKNOWN = 'unknown'
}

// Define error interface
export interface AuthError {
  message: string;
  category: AuthErrorCategory;
  originalError?: Error;
  code?: string;
  details?: Record<string, any>;
}

// Common error patterns to match
const ERROR_PATTERNS = {
  INVALID_CREDENTIALS: [
    'invalid login credentials',
    'invalid email or password',
    'incorrect password',
    'user not found',
    'invalid credentials'
  ],
  NETWORK: [
    'network error',
    'failed to fetch',
    'connection failed',
    'timeout',
    'offline'
  ],
  PERMISSION: [
    'permission denied',
    'not authorized',
    'insufficient privileges',
    'access denied'
  ],
  VALIDATION: [
    'validation failed',
    'invalid email',
    'password too short',
    'required field'
  ],
  SESSION: [
    'session expired',
    'invalid session',
    'token expired',
    'invalid token'
  ],
  MFA: [
    'invalid code',
    'mfa required',
    'verification failed',
    'factor not found'
  ],
  OAUTH: [
    'oauth error',
    'provider error',
    'callback failed',
    'identity provider'
  ]
};

/**
 * Categorize an error based on its message
 */
export const categorizeAuthError = (error: Error | string): AuthErrorCategory => {
  const errorMessage = typeof error === 'string' ? error.toLowerCase() : error.message.toLowerCase();
  
  // Check each category for matching patterns
  for (const [category, patterns] of Object.entries(ERROR_PATTERNS)) {
    if (patterns.some(pattern => errorMessage.includes(pattern.toLowerCase()))) {
      return AuthErrorCategory[category as keyof typeof AuthErrorCategory];
    }
  }
  
  return AuthErrorCategory.UNKNOWN;
};

/**
 * Format an error for user display
 */
export const formatAuthError = (error: Error | string): AuthError => {
  const originalMessage = typeof error === 'string' ? error : error.message;
  const category = categorizeAuthError(error);
  
  // Create a user-friendly message based on category
  let userMessage: string;
  
  switch (category) {
    case AuthErrorCategory.CREDENTIALS:
      userMessage = 'Invalid email or password. Please try again.';
      break;
    case AuthErrorCategory.NETWORK:
      userMessage = 'Network error. Please check your connection and try again.';
      break;
    case AuthErrorCategory.PERMISSION:
      userMessage = 'You do not have permission to perform this action.';
      break;
    case AuthErrorCategory.VALIDATION:
      userMessage = 'Please check your information and try again.';
      break;
    case AuthErrorCategory.SESSION:
      userMessage = 'Your session has expired. Please log in again.';
      break;
    case AuthErrorCategory.MFA:
      userMessage = 'Two-factor authentication failed. Please try again.';
      break;
    case AuthErrorCategory.OAUTH:
      userMessage = 'Social login failed. Please try again or use email/password.';
      break;
    default:
      userMessage = 'An unexpected error occurred. Please try again later.';
  }
  
  return {
    message: userMessage,
    category,
    originalError: typeof error === 'string' ? new Error(error) : error,
    details: {
      originalMessage
    }
  };
};

/**
 * Log an authentication error with appropriate level
 */
export const logAuthError = (error: AuthError): void => {
  const { category, message, originalError, details } = error;
  
  // Determine log level based on category
  switch (category) {
    case AuthErrorCategory.CREDENTIALS:
    case AuthErrorCategory.VALIDATION:
      // These are common user errors, log as info
      console.info(`[Auth] ${message}`, { category, details });
      break;
    case AuthErrorCategory.NETWORK:
    case AuthErrorCategory.SESSION:
      // These are potentially recoverable errors, log as warn
      console.warn(`[Auth] ${message}`, { category, originalError, details });
      break;
    default:
      // All other errors are potentially serious, log as error
      console.error(`[Auth] ${message}`, { category, originalError, details });
  }
};

/**
 * Handle an authentication error (format and log)
 */
export const handleAuthError = (error: Error | string): AuthError => {
  const formattedError = formatAuthError(error);
  logAuthError(formattedError);
  return formattedError;
};

export default handleAuthError;
