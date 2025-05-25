/**
 * Lazy Load Utility
 * 
 * This utility provides a way to lazy load components and modules.
 */

import React, { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Options for lazy loading
 */
export interface LazyLoadOptions {
  /** Minimum delay before loading (ms) */
  minDelay?: number;
  /** Maximum delay before timeout (ms) */
  timeout?: number;
  /** Retry count for failed loads */
  retryCount?: number;
  /** Delay between retries (ms) */
  retryDelay?: number;
  /** Preload the component */
  preload?: boolean;
}

/**
 * Default options for lazy loading
 */
const defaultOptions: LazyLoadOptions = {
  minDelay: 0,
  timeout: 10000,
  retryCount: 3,
  retryDelay: 1000,
  preload: false
};

/**
 * Create a lazy loaded component with enhanced features
 * 
 * @param factory - Factory function that imports the component
 * @param options - Lazy loading options
 * @returns Lazy loaded component
 * 
 * @example
 * ```tsx
 * const LazyComponent = lazyLoad(() => import('./HeavyComponent'));
 * 
 * // With options
 * const LazyComponent = lazyLoad(() => import('./HeavyComponent'), {
 *   minDelay: 300,
 *   timeout: 5000,
 *   retryCount: 2,
 *   preload: true
 * });
 * 
 * // Use with suspense
 * function MyComponent() {
 *   return (
 *     <Suspense fallback={<Loading />}>
 *       <LazyComponent />
 *     </Suspense>
 *   );
 * }
 * ```
 */
export function lazyLoad<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): LazyExoticComponent<T> & { preload: () => Promise<void> } {
  // Merge options with defaults
  const { minDelay, timeout, retryCount, retryDelay, preload } = {
    ...defaultOptions,
    ...options
  };

  // Create a promise that resolves after minDelay
  const delayPromise = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Create a promise that rejects after timeout
  const timeoutPromise = (ms: number) =>
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Lazy load timeout after ${ms}ms`)), ms)
    );

  // Create a function to load the component with retry logic
  const loadComponentWithRetry = async (
    retries: number = 0
  ): Promise<{ default: T }> => {
    try {
      // Load the component and wait for minDelay
      const [component] = await Promise.all([
        factory(),
        minDelay ? delayPromise(minDelay) : Promise.resolve()
      ]);
      
      return component;
    } catch (error) {
      // If we have retries left, wait and try again
      if (retries < (retryCount || 0)) {
        await delayPromise(retryDelay || 1000);
        return loadComponentWithRetry(retries + 1);
      }
      
      // Otherwise, rethrow the error
      throw error;
    }
  };

  // Create the lazy component with timeout
  const LazyComponent = lazy(() =>
    Promise.race([
      loadComponentWithRetry(),
      timeout ? timeoutPromise(timeout) : new Promise<never>(() => {})
    ])
  );

  // Add preload method to the component
  const EnhancedComponent = LazyComponent as LazyExoticComponent<T> & {
    preload: () => Promise<void>;
  };

  // Define preload method
  EnhancedComponent.preload = async () => {
    try {
      await loadComponentWithRetry();
    } catch (error) {
      console.error('Error preloading component:', error);
    }
  };

  // Preload the component if requested
  if (preload) {
    EnhancedComponent.preload();
  }

  return EnhancedComponent;
}

/**
 * Preload a module without rendering it
 * 
 * @param factory - Factory function that imports the module
 * @returns Promise that resolves when the module is loaded
 * 
 * @example
 * ```tsx
 * // Preload a module
 * preloadModule(() => import('./HeavyModule'));
 * 
 * // Preload on hover
 * function MyComponent() {
 *   const handleMouseEnter = () => {
 *     preloadModule(() => import('./PageToPreload'));
 *   };
 *   
 *   return (
 *     <Link to="/page" onMouseEnter={handleMouseEnter}>
 *       Go to Page
 *     </Link>
 *   );
 * }
 * ```
 */
export function preloadModule<T>(factory: () => Promise<T>): Promise<T> {
  return factory();
}

export default lazyLoad;
