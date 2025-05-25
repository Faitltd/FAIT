import React, { lazy, Suspense } from 'react';
import { trackError } from './errorTracking';

/**
 * Enhanced lazy loading utility with error handling and retry logic
 * 
 * @param {Function} importFn - Dynamic import function
 * @param {Object} options - Configuration options
 * @returns {React.LazyExoticComponent} - Lazy loaded component
 */
export const lazyWithRetry = (importFn, options = {}) => {
  const {
    fallback = <div className="flex justify-center items-center h-64">Loading...</div>,
    errorFallback = null,
    retries = 2,
    retryDelay = 1500,
  } = options;
  
  const LazyComponent = lazy(() => {
    let attemptCount = 0;
    
    const retry = () => {
      return importFn().catch(error => {
        if (attemptCount < retries) {
          attemptCount++;
          
          // Log the retry attempt
          console.warn(`Retry attempt ${attemptCount} for lazy-loaded component`);
          
          // Wait before retrying
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(retry());
            }, retryDelay);
          });
        }
        
        // Track the error after all retries fail
        trackError({
          type: 'lazyload',
          message: `Failed to lazy load component after ${retries} retries`,
          error,
          timestamp: new Date().toISOString()
        });
        
        throw error;
      });
    };
    
    return retry();
  });
  
  // Return a component that handles the Suspense boundary
  return (props) => (
    <Suspense fallback={fallback}>
      {errorFallback ? (
        <ErrorBoundary fallback={errorFallback}>
          <LazyComponent {...props} />
        </ErrorBoundary>
      ) : (
        <LazyComponent {...props} />
      )}
    </Suspense>
  );
};

/**
 * Error boundary component for lazy loaded components
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    trackError({
      type: 'boundary',
      message: error.message,
      error,
      errorInfo,
      timestamp: new Date().toISOString()
    });
  }

  render() {
    if (this.state.hasError) {
      return typeof this.props.fallback === 'function'
        ? this.props.fallback(this.state.error)
        : this.props.fallback;
    }

    return this.props.children;
  }
}

/**
 * Create a lazy loaded route component with proper error handling
 * 
 * @param {string} componentPath - Path to the component
 * @param {Object} options - Configuration options
 * @returns {Object} - Route configuration object
 */
export const createLazyRoute = (componentPath, options = {}) => {
  const {
    loadingMessage = 'Loading...',
    errorElement = null,
    ...lazyOptions
  } = options;
  
  const loadingFallback = (
    <div className="flex justify-center items-center h-64">
      {loadingMessage}
    </div>
  );
  
  const Component = lazyWithRetry(
    () => import(/* @vite-ignore */ componentPath),
    {
      fallback: loadingFallback,
      ...lazyOptions
    }
  );
  
  return {
    element: <Component />,
    errorElement
  };
};
