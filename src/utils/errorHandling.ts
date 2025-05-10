/**
 * Utility functions for handling errors consistently across the application
 */

/**
 * Format an error message for display to the user
 * @param error The error object or message
 * @param fallbackMessage A fallback message if the error doesn't have a message
 * @returns A formatted error message string
 */
export const formatErrorMessage = (error: unknown, fallbackMessage: string = 'An unexpected error occurred'): string => {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === 'string') {
    return error;
  } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  } else {
    return fallbackMessage;
  }
};

/**
 * Log an error to the console with additional context
 * @param error The error object
 * @param context Additional context about where the error occurred
 */
export const logError = (error: unknown, context: string): void => {
  console.error(`Error in ${context}:`, error);
  
  // In a production app, you might want to send this to an error tracking service
  // like Sentry or LogRocket
  // Example: Sentry.captureException(error, { extra: { context } });
};

/**
 * Handle an API error by logging it and returning a formatted message
 * @param error The error object
 * @param context The context where the error occurred
 * @param fallbackMessage A fallback message if the error doesn't have a message
 * @returns A formatted error message string
 */
export const handleApiError = (
  error: unknown, 
  context: string, 
  fallbackMessage: string = 'Failed to complete the request'
): string => {
  logError(error, context);
  return formatErrorMessage(error, fallbackMessage);
};
