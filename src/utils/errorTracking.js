/**
 * Error tracking utility for centralized error handling
 */

// Track errors that occur in the application
const errors = [];
const MAX_ERRORS = 50; // Limit the number of errors we store

// Initialize error tracking
export const initErrorTracking = () => {
  // Set up global error handler
  window.addEventListener('error', (event) => {
    trackError({
      type: 'unhandled',
      message: event.message,
      source: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      timestamp: new Date().toISOString()
    });
    
    // Don't prevent default so browser console still shows the error
    return false;
  });
  
  // Set up promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    trackError({
      type: 'promise',
      message: event.reason?.message || 'Unhandled Promise Rejection',
      error: event.reason,
      timestamp: new Date().toISOString()
    });
    
    // Don't prevent default
    return false;
  });
  
  // Replace console.error to track errors logged there
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Call the original console.error
    originalConsoleError.apply(console, args);
    
    // Track the error
    trackError({
      type: 'console',
      message: args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' '),
      timestamp: new Date().toISOString()
    });
  };
};

// Track an error
export const trackError = (errorInfo) => {
  // Add to our local store
  errors.push(errorInfo);
  
  // Keep the array at a reasonable size
  if (errors.length > MAX_ERRORS) {
    errors.shift();
  }
  
  // Here you would typically send to a service like Sentry, LogRocket, etc.
  // For now, we'll just store locally
  
  // You could also persist to localStorage for debugging
  try {
    const storedErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
    storedErrors.push(errorInfo);
    if (storedErrors.length > MAX_ERRORS) {
      storedErrors.splice(0, storedErrors.length - MAX_ERRORS);
    }
    localStorage.setItem('app_errors', JSON.stringify(storedErrors));
  } catch (e) {
    // Ignore localStorage errors
  }
};

// Get all tracked errors
export const getErrors = () => {
  return [...errors];
};

// Clear all tracked errors
export const clearErrors = () => {
  errors.length = 0;
  try {
    localStorage.removeItem('app_errors');
  } catch (e) {
    // Ignore localStorage errors
  }
};

// Report errors to a backend service
export const reportErrors = async (endpoint = '/api/error-reporting') => {
  if (errors.length === 0) return;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ errors }),
    });
    
    if (response.ok) {
      // Clear successfully reported errors
      clearErrors();
    }
  } catch (e) {
    console.error('Failed to report errors:', e);
  }
};
