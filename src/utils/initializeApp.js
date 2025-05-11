/**
 * Application Initialization Utilities
 * 
 * This file contains functions to initialize various aspects of the application,
 * including performance optimizations, service workers, and error tracking.
 */

import { registerServiceWorker, isServiceWorkerActive } from './serviceWorkerRegistration';
import { trackError } from './errorTracking';

/**
 * Initialize the application
 * 
 * @returns {Promise<Object>} Initialization status
 */
export const initializeApp = async () => {
  try {
    // Initialize service worker
    await initializeServiceWorker();
    
    // Initialize performance optimizations
    await initializePerformanceOptimizations();
    
    // Initialize error tracking
    initializeErrorTracking();
    
    return {
      success: true,
      serviceWorkerActive: await isServiceWorkerActive(),
    };
  } catch (error) {
    console.error('Error initializing application:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Initialize service worker
 * 
 * @returns {Promise<ServiceWorkerRegistration|null>} Service worker registration
 */
export const initializeServiceWorker = async () => {
  try {
    const registration = await registerServiceWorker({
      onSuccess: (registration) => {
        console.log('Service worker is active');
      },
      onUpdate: (registration) => {
        // Show a notification to the user that there's a new version available
        const updateAvailable = new CustomEvent('serviceWorkerUpdateAvailable', {
          detail: { registration }
        });
        window.dispatchEvent(updateAvailable);
      },
      onError: (error) => {
        console.error('Error updating service worker:', error);
      }
    });
    
    return registration;
  } catch (error) {
    console.error('Error initializing service worker:', error);
    return null;
  }
};

/**
 * Initialize performance optimizations
 * 
 * @returns {Promise<boolean>} Success status
 */
export const initializePerformanceOptimizations = async () => {
  try {
    // Check if the browser supports performance APIs
    if (!window.performance) {
      console.warn('Performance API is not supported in this browser');
      return false;
    }
    
    // Mark the start of the application initialization
    if (window.performance.mark) {
      window.performance.mark('app_init_start');
    }
    
    // Initialize resource timing buffer
    if (window.performance.setResourceTimingBufferSize) {
      window.performance.setResourceTimingBufferSize(300);
    }
    
    // Set up performance observers if supported
    if ('PerformanceObserver' in window) {
      try {
        // Observe long tasks
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            console.warn(`Long task detected: ${entry.duration}ms`, entry);
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        
        // Observe largest contentful paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log(`Largest Contentful Paint: ${lastEntry.startTime}ms`);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Observe first input delay
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            const delay = entry.processingStart - entry.startTime;
            console.log(`First Input Delay: ${delay}ms`);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        
        // Observe layout shifts
        const clsObserver = new PerformanceObserver((list) => {
          let cumulativeLayoutShift = 0;
          list.getEntries().forEach((entry) => {
            if (!entry.hadRecentInput) {
              cumulativeLayoutShift += entry.value;
            }
          });
          console.log(`Cumulative Layout Shift: ${cumulativeLayoutShift}`);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Error setting up PerformanceObserver:', error);
      }
    }
    
    // Mark the end of the application initialization
    if (window.performance.mark) {
      window.performance.mark('app_init_end');
      window.performance.measure('app_initialization', 'app_init_start', 'app_init_end');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing performance optimizations:', error);
    return false;
  }
};

/**
 * Initialize error tracking
 * 
 * @returns {boolean} Success status
 */
export const initializeErrorTracking = () => {
  try {
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
    
    return true;
  } catch (error) {
    console.error('Error initializing error tracking:', error);
    return false;
  }
};
