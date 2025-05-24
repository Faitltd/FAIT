/**
 * Application optimization utilities
 * 
 * This file integrates all optimization utilities and provides a simple API
 * for using them throughout the application.
 */

import { initErrorTracking } from './errorTracking';
import { fetchWithRetry, safeApiCall } from './apiUtils';
import circuitBreaker from './circuitBreaker';
import { cache, memoize, createCachedApi } from './cacheUtils';
import { initPerformanceMonitoring, markStart, markEnd, trackInteraction } from './performanceMonitor';
import networkStatus, { EVENTS as NETWORK_EVENTS } from './networkStatus';
import { lazyWithRetry, createLazyRoute } from './lazyLoad';
import { optimizeRenders, withPerformanceTracking, withLazyRender } from './componentOptimization';

/**
 * Initialize all optimization utilities
 */
export function initializeOptimizations() {
  // Initialize error tracking
  initErrorTracking();
  
  // Initialize performance monitoring
  initPerformanceMonitoring();
  
  // Register service worker
  registerServiceWorker();
  
  // Set up network status listeners
  setupNetworkListeners();
  
  console.log('✅ Application optimizations initialized');
  
  return {
    networkStatus: networkStatus.getStatus(),
  };
}

/**
 * Register service worker
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope:', registration.scope);
        })
        .catch(error => {
          console.error('ServiceWorker registration failed:', error);
        });
    });
  }
}

/**
 * Set up network status listeners
 */
function setupNetworkListeners() {
  // Listen for online/offline events
  networkStatus.addEventListener(NETWORK_EVENTS.ONLINE, (status) => {
    console.log('🌐 Application is online');
    
    // Sync any pending data
    syncOfflineData();
  });
  
  networkStatus.addEventListener(NETWORK_EVENTS.OFFLINE, (status) => {
    console.log('📴 Application is offline');
  });
  
  // Listen for slow connection
  networkStatus.addEventListener(NETWORK_EVENTS.SLOW, (status) => {
    console.log('🐢 Slow connection detected', status);
    
    // Enable data saving mode
    enableDataSavingMode();
  });
}

/**
 * Sync offline data when coming back online
 */
async function syncOfflineData() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      // Trigger background sync
      const registration = await navigator.serviceWorker.ready;
      if ('sync' in registration) {
        await registration.sync.register('sync-forms');
        console.log('Background sync registered');
      }
    } catch (error) {
      console.error('Failed to register background sync:', error);
    }
  }
}

/**
 * Enable data saving mode for slow connections
 */
function enableDataSavingMode() {
  // Set a flag in localStorage
  localStorage.setItem('data_saving_mode', 'true');
  
  // Dispatch an event so components can react
  window.dispatchEvent(new CustomEvent('data-saving-mode', { detail: { enabled: true } }));
}

/**
 * Create an optimized API client
 * 
 * @param {string} baseUrl - Base URL for API
 * @returns {Object} - Optimized API client
 */
export function createOptimizedApiClient(baseUrl = '') {
  // Create fetch function with retry
  const fetchWithCircuitBreaker = async (url, options = {}) => {
    const fullUrl = `${baseUrl}${url}`;
    
    return circuitBreaker.exec(
      () => fetchWithRetry(fullUrl, options),
      url.split('?')[0] // Use path without query params as service key
    );
  };
  
  // Create cached version for GET requests
  const cachedGet = createCachedApi(
    (url, options = {}) => fetchWithCircuitBreaker(url, { ...options, method: 'GET' }),
    { ttl: 5 * 60 * 1000 } // 5 minutes cache
  );
  
  // Return API client
  return {
    get: (url, options = {}) => {
      return safeApiCall(() => cachedGet(url, options));
    },
    
    post: (url, data, options = {}) => {
      return safeApiCall(() => 
        fetchWithCircuitBreaker(url, {
          ...options,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          body: JSON.stringify(data)
        })
      );
    },
    
    put: (url, data, options = {}) => {
      return safeApiCall(() => 
        fetchWithCircuitBreaker(url, {
          ...options,
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          body: JSON.stringify(data)
        })
      );
    },
    
    delete: (url, options = {}) => {
      return safeApiCall(() => 
        fetchWithCircuitBreaker(url, {
          ...options,
          method: 'DELETE'
        })
      );
    },
    
    // Clear cache for specific URL or all URLs
    clearCache: (url = null) => {
      if (url) {
        cache.delete(`memo:${url}`);
      } else {
        cache.clear();
      }
    }
  };
}

/**
 * Create optimized routes with proper error handling and lazy loading
 * 
 * @param {Object} routes - Route definitions
 * @returns {Array} - Optimized routes
 */
export function createOptimizedRoutes(routes) {
  return Object.entries(routes).map(([path, config]) => {
    const { component, ...routeConfig } = config;
    
    return {
      path,
      ...createLazyRoute(component, {
        loadingMessage: `Loading ${path}...`,
        ...routeConfig
      })
    };
  });
}

// Export all utilities for direct use
export {
  // Error handling
  initErrorTracking,
  
  // API utilities
  fetchWithRetry,
  safeApiCall,
  circuitBreaker,
  
  // Caching
  cache,
  memoize,
  createCachedApi,
  
  // Performance monitoring
  initPerformanceMonitoring,
  markStart,
  markEnd,
  trackInteraction,
  
  // Network status
  networkStatus,
  NETWORK_EVENTS,
  
  // Lazy loading
  lazyWithRetry,
  createLazyRoute,
  
  // Component optimization
  optimizeRenders,
  withPerformanceTracking,
  withLazyRender
};
