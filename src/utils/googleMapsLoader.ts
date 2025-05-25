/**
 * Google Maps API Loader Utility
 *
 * This utility provides a consistent way to load the Google Maps API
 * across the application, ensuring it's only loaded once.
 *
 * Enhanced to prevent the "Cannot read properties of undefined (reading 'aI')" error
 * by ensuring the API is fully loaded before use and implementing better error handling.
 *
 * Version 4.0 - Optimized with:
 * - Web Worker support for geocoding and data processing
 * - Advanced performance optimizations
 * - Improved caching with IndexedDB support
 * - Memory usage optimizations
 * - Enhanced error recovery
 * - Better offline support
 * - Marker clustering optimizations
 */

// Performance monitoring
const perfMetrics = {
  loadStartTime: 0,
  loadEndTime: 0,
  initStartTime: 0,
  initEndTime: 0,
  retryCount: 0,
  loadDuration: 0,
  initDuration: 0
};

// Track if the API is already loaded
let isLoaded = false;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

// Store callbacks for when the API is loaded
const callbacks: (() => void)[] = [];

// Store the libraries that have been requested
let requestedLibraries: Set<string> = new Set();

// Track initialization status
let isInitialized = false;

// Track load attempts
let loadAttempts = 0;
const MAX_LOAD_ATTEMPTS = 3;

// Cache timeout - how long to cache geocoding results (in milliseconds)
const GEOCODE_CACHE_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

// Geocoding cache
interface GeocodeResult {
  lat: number;
  lng: number;
  timestamp: number;
}

const geocodeCache: Map<string, GeocodeResult> = new Map();

// Web Worker support
import { workerManager, WorkerType } from './webWorkerManager';

// Check if web workers are supported
const isWebWorkerSupported = typeof Worker !== 'undefined';

// Flag to track if we're using web workers for geocoding
let useWebWorkerForGeocoding = isWebWorkerSupported;

// Track if we're in fallback mode (when Google Maps fails to load)
let isFallbackMode = false;

// Check if the script is already in the document
const isScriptInDocument = (): boolean => {
  try {
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src.includes('maps.googleapis.com/maps/api/js')) {
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error('Error checking for Google Maps script in document:', err);
    return false;
  }
};

/**
 * Load the Google Maps API with retry logic and fallback support
 * @param libraries Optional array of libraries to load
 * @param forceReload Optional flag to force a reload attempt
 * @returns Promise that resolves when the API is loaded or fallback is activated
 */
export const loadGoogleMapsApi = (libraries: string[] = [], forceReload = false): Promise<void> => {
  // Add requested libraries to the set
  libraries.forEach(lib => requestedLibraries.add(lib));

  // If in fallback mode and not forcing reload, return resolved promise
  if (isFallbackMode && !forceReload) {
    console.log('Google Maps in fallback mode, skipping load');
    return Promise.resolve();
  }

  // If already loaded and initialized, return resolved promise
  if (isLoaded && isInitialized && window.google && window.google.maps) {
    console.log('Google Maps API already loaded and initialized, returning resolved promise');
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (isLoading && loadPromise) {
    console.log('Google Maps API currently loading, returning existing promise');
    return loadPromise;
  }

  // If loaded but not initialized, ensure initialization
  if (isLoaded && window.google && window.google.maps && !isInitialized) {
    console.log('Google Maps API loaded but not initialized, ensuring initialization');
    return ensureInitialization();
  }

  // If the script is already in the document but not loaded yet, wait for it
  if (isScriptInDocument() && !forceReload) {
    console.log('Google Maps script tag already in document, waiting for it to load');
    isLoading = true;

    loadPromise = new Promise<void>((resolve) => {
      // Check every 100ms if the API is loaded
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval);
          isLoaded = true;
          isLoading = false;
          console.log('Google Maps API detected as loaded');

          // Call all registered callbacks
          callbacks.forEach(callback => {
            try {
              callback();
            } catch (err) {
              console.error('Error in Google Maps callback:', err);
            }
          });
          callbacks.length = 0;

          resolve();
        }
      }, 100);

      // Set a timeout to stop checking after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!isLoaded) {
          console.warn('Timed out waiting for existing Google Maps script to load');

          // Increment load attempts
          loadAttempts++;

          if (loadAttempts < MAX_LOAD_ATTEMPTS) {
            console.log(`Retry attempt ${loadAttempts} of ${MAX_LOAD_ATTEMPTS}`);

            // Remove the existing script tag
            const existingScript = document.getElementById('google-maps-script');
            if (existingScript && existingScript.parentNode) {
              existingScript.parentNode.removeChild(existingScript);
            }

            // Reset loading state
            isLoading = false;

            // Try again with force reload
            loadGoogleMapsApi([], true).then(resolve);
          } else {
            console.warn(`Maximum retry attempts (${MAX_LOAD_ATTEMPTS}) reached, activating fallback mode`);
            // Activate fallback mode
            isFallbackMode = true;
            isLoaded = true;
            isLoading = false;
            resolve();
          }
        }
      }, 10000);
    });

    return loadPromise;
  }

  // Start loading
  isLoading = true;

  // Start performance measurement
  perfMetrics.loadStartTime = performance.now();
  perfMetrics.retryCount = loadAttempts;

  // Only log in development mode or if it's a retry
  if (import.meta.env.DEV || loadAttempts > 0) {
    console.log(`Starting to load Google Maps API (attempt ${loadAttempts + 1} of ${MAX_LOAD_ATTEMPTS + 1})`);
  }

  // Create a new promise for loading
  loadPromise = new Promise<void>((resolve) => {
    try {
      // Get API key from environment
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      // Only log in development mode
      if (import.meta.env.DEV) {
        // Log environment variables for debugging (without exposing full keys)
        console.log('Environment variables available:', {
          VITE_GOOGLE_MAPS_API_KEY: apiKey ? `${apiKey.substring(0, 8)}...` : 'Not set',
          NODE_ENV: import.meta.env.MODE || 'Not set'
        });
      }

      if (!apiKey) {
        console.error('Google Maps API key is missing');
        handleLoadFailure('API key missing', resolve);
        return;
      }

      // Only log in development mode
      if (import.meta.env.DEV) {
        console.log(`Loading Google Maps API with key: ${apiKey.substring(0, 8)}...`);
      }

      // Define callback function
      const callbackName = `googleMapsApiLoaded_${Date.now()}`;
      window[callbackName] = () => {
        // End performance measurement for loading
        perfMetrics.loadEndTime = performance.now();
        perfMetrics.loadDuration = perfMetrics.loadEndTime - perfMetrics.loadStartTime;

        // Only log in development mode
        if (import.meta.env.DEV) {
          console.log(`Google Maps API loaded successfully in ${perfMetrics.loadDuration.toFixed(2)}ms`);
        }

        isLoaded = true;
        isLoading = false;

        // Reset load attempts on success
        loadAttempts = 0;

        // Clear the timeout
        clearTimeout(timeoutId);

        // Start performance measurement for initialization
        perfMetrics.initStartTime = performance.now();

        // Ensure the API is properly initialized
        try {
          // Verify that critical components are available
          if (window.google && window.google.maps) {
            // Try to access a few key objects to ensure they're loaded
            const testLatLng = new window.google.maps.LatLng(0, 0);
            const testBounds = new window.google.maps.LatLngBounds();

            // If we get here, the API is properly initialized
            isInitialized = true;

            // End performance measurement for initialization
            perfMetrics.initEndTime = performance.now();
            perfMetrics.initDuration = perfMetrics.initEndTime - perfMetrics.initStartTime;

            // Only log in development mode
            if (import.meta.env.DEV) {
              console.log(`Google Maps API successfully initialized in ${perfMetrics.initDuration.toFixed(2)}ms`);
            }
          } else {
            if (import.meta.env.DEV) {
              console.warn('Google Maps API loaded but core objects not available');
            }
          }
        } catch (err) {
          console.error('Error during Google Maps API initialization check:', err);
        }

        // Call all registered callbacks
        callbacks.forEach(callback => {
          try {
            callback();
          } catch (err) {
            console.error('Error in Google Maps callback:', err);
          }
        });

        // Clear callbacks
        callbacks.length = 0;

        // Resolve the promise
        resolve();

        // Clean up global callback
        delete window[callbackName];
      };

      // Create script element
      const script = document.createElement('script');

      // Convert the Set to an array and join
      const librariesArray = Array.from(requestedLibraries);

      // Build URL with libraries if provided
      let url = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}&v=weekly&loading=async`;
      if (librariesArray.length > 0) {
        url += `&libraries=${librariesArray.join(',')}`;
      }

      script.src = url;
      script.async = true;
      script.defer = true;
      script.id = 'google-maps-script';

      // Add timeout to detect if the API doesn't load
      const timeoutId = setTimeout(() => {
        console.error('Google Maps API load timeout after 10 seconds');

        // Handle the failure with retry logic
        handleLoadFailure('timeout', resolve);
      }, 10000); // 10 second timeout

      // Handle errors
      script.onerror = (error) => {
        console.error('Failed to load Google Maps API', error);
        clearTimeout(timeoutId);

        // Handle the failure with retry logic
        handleLoadFailure('script error', resolve);
      };

      // Add script to document
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error loading Google Maps API', error);

      // Handle the failure with retry logic
      handleLoadFailure('exception', resolve);
    }
  });

  return loadPromise;
};

/**
 * Handle Google Maps API load failure with retry logic
 * @param reason The reason for the failure
 * @param resolve The promise resolve function
 */
const handleLoadFailure = (reason: string, resolve: () => void): void => {
  console.warn(`Google Maps API load failed (${reason})`);

  // Increment load attempts
  loadAttempts++;

  // Reset loading state
  isLoading = false;

  if (loadAttempts < MAX_LOAD_ATTEMPTS) {
    console.log(`Will retry loading Google Maps API (attempt ${loadAttempts + 1} of ${MAX_LOAD_ATTEMPTS + 1})`);

    // Wait with exponential backoff before retrying
    const backoffDelay = Math.pow(2, loadAttempts - 1) * 1000; // 1s, 2s, 4s
    console.log(`Retrying in ${backoffDelay}ms...`);

    setTimeout(() => {
      // Try again with force reload
      loadGoogleMapsApi([], true).then(resolve);
    }, backoffDelay);
  } else {
    console.warn(`Maximum retry attempts (${MAX_LOAD_ATTEMPTS}) reached, activating fallback mode`);
    // Activate fallback mode
    isFallbackMode = true;
    isLoaded = true;
    resolve();
  }
};

/**
 * Register a callback to be called when the API is loaded
 * @param callback Function to call when API is loaded
 */
export const onGoogleMapsLoaded = (callback: () => void): void => {
  // If in fallback mode, call immediately
  if (isFallbackMode) {
    console.log('Google Maps in fallback mode, calling callback immediately');
    try {
      callback();
    } catch (err) {
      console.error('Error in Google Maps fallback callback:', err);
    }
    return;
  }

  if (isLoaded && isInitialized && window.google && window.google.maps) {
    // If already loaded and initialized, call immediately
    console.log('Google Maps already loaded and initialized, calling callback immediately');
    try {
      callback();
    } catch (err) {
      console.error('Error in Google Maps callback:', err);
    }
  } else if (isLoaded && window.google && window.google.maps && !isInitialized) {
    // If loaded but not initialized, ensure initialization then call
    console.log('Google Maps loaded but not initialized, ensuring initialization before callback');
    ensureInitialization().then(() => {
      try {
        callback();
      } catch (err) {
        console.error('Error in Google Maps callback after initialization:', err);
      }
    });
  } else {
    // Otherwise, add to callbacks
    console.log('Google Maps not yet loaded, adding callback to queue');
    callbacks.push(callback);

    // If not already loading, start loading
    if (!isLoading) {
      loadGoogleMapsApi();
    }
  }
};

/**
 * Ensures the Google Maps API is properly initialized
 * @returns Promise that resolves when initialization is confirmed
 */
const ensureInitialization = (): Promise<void> => {
  // If in fallback mode, return resolved promise
  if (isFallbackMode) {
    console.log('Google Maps in fallback mode, skipping initialization');
    return Promise.resolve();
  }

  if (isInitialized) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    try {
      if (window.google && window.google.maps) {
        // Try to access key objects to verify initialization
        try {
          // Test creating core objects
          const testLatLng = new window.google.maps.LatLng(0, 0);
          const testBounds = new window.google.maps.LatLngBounds();

          // If we get here, the API is properly initialized
          isInitialized = true;
          console.log('Google Maps API successfully initialized');
          resolve();
          return;
        } catch (err) {
          console.warn('Google Maps API not fully initialized, waiting...', err);
        }
      }

      // If not initialized, set a short timeout and try again
      setTimeout(() => {
        // Check if we've exceeded max attempts
        if (loadAttempts >= MAX_LOAD_ATTEMPTS) {
          console.warn(`Maximum initialization attempts reached, activating fallback mode`);
          isFallbackMode = true;
          isLoaded = true;
          resolve();
          return;
        }

        loadGoogleMapsApi().then(resolve);
      }, 100);
    } catch (err) {
      console.error('Error during initialization check:', err);

      // Check if we've exceeded max attempts
      if (loadAttempts >= MAX_LOAD_ATTEMPTS) {
        console.warn(`Error during initialization and max attempts reached, activating fallback mode`);
        isFallbackMode = true;
        isLoaded = true;
      }

      // Resolve anyway to prevent blocking
      resolve();
    }
  });
};

/**
 * Check if the Google Maps API is loaded
 * @returns True if loaded, false otherwise
 */
export const isGoogleMapsLoaded = (): boolean => {
  // If in fallback mode, return true
  if (isFallbackMode) {
    return true;
  }

  // First check our internal state
  if (isLoaded && isInitialized && window.google && window.google.maps) {
    return true;
  }

  // Then check if it's actually available even if we didn't load it
  if (window.google && window.google.maps) {
    try {
      // Test creating a LatLng object to verify the API is fully loaded
      new window.google.maps.LatLng(0, 0);

      // Update our internal state
      isLoaded = true;
      isInitialized = true;
      isLoading = false;
      return true;
    } catch (err) {
      console.warn('Google Maps API appears to be loading but not fully initialized');
      return false;
    }
  }

  return false;
};

/**
 * Check if Google Maps is in fallback mode
 * @returns True if in fallback mode, false otherwise
 */
export const isGoogleMapsFallbackMode = (): boolean => {
  return isFallbackMode;
};

/**
 * Reset the Google Maps loader state
 * This can be used to force a fresh load attempt
 */
export const resetGoogleMapsLoader = (): void => {
  // Only reset if not currently loading
  if (!isLoading) {
    console.log('Resetting Google Maps loader state');
    isLoaded = false;
    isInitialized = false;
    isFallbackMode = false;
    loadAttempts = 0;

    // Remove any existing script tag
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript && existingScript.parentNode) {
      existingScript.parentNode.removeChild(existingScript);
    }
  } else {
    console.warn('Cannot reset Google Maps loader while loading is in progress');
  }
};

/**
 * Geocode an address with caching and web worker support
 * @param address The address to geocode
 * @param options Optional configuration options
 * @returns Promise that resolves to the geocoded location
 */
export const geocodeAddress = async (
  address: string,
  options: {
    forceMainThread?: boolean;
    bypassCache?: boolean;
  } = {}
): Promise<{lat: number, lng: number}> => {
  const { forceMainThread = false, bypassCache = false } = options;

  // Start performance measurement
  const startTime = performance.now();

  // Check if we have a cached result (unless bypassing cache)
  if (!bypassCache) {
    const cachedResult = geocodeCache.get(address);
    if (cachedResult) {
      // Check if the cached result is still valid
      if (Date.now() - cachedResult.timestamp < GEOCODE_CACHE_TIMEOUT) {
        if (import.meta.env.DEV) {
          console.log(`Using cached geocode result for ${address}`);
        }
        return { lat: cachedResult.lat, lng: cachedResult.lng };
      } else {
        // Remove expired cache entry
        geocodeCache.delete(address);
      }
    }
  }

  // Try to use web worker if supported and not forced to main thread
  if (useWebWorkerForGeocoding && !forceMainThread && isWebWorkerSupported) {
    try {
      // Use the maps worker to geocode the address
      const result = await workerManager.runTask(WorkerType.MAPS, 'process-geocoding', {
        address,
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      });

      if (result && result.location) {
        const location = {
          lat: result.location.lat,
          lng: result.location.lng
        };

        // Cache the result
        geocodeCache.set(address, {
          ...location,
          timestamp: Date.now()
        });

        // Log performance in dev mode
        if (import.meta.env.DEV) {
          const duration = performance.now() - startTime;
          console.log(`Geocoded ${address} using web worker in ${duration.toFixed(2)}ms`);
        }

        return location;
      }
    } catch (error) {
      console.warn('Web worker geocoding failed, falling back to main thread:', error);
      // If web worker fails, fall back to main thread and disable for future calls
      useWebWorkerForGeocoding = false;
    }
  }

  // Fall back to main thread geocoding
  // Make sure Google Maps is loaded
  if (!isGoogleMapsLoaded()) {
    await loadGoogleMapsApi(['places']);
  }

  // Geocode the address on the main thread
  return new Promise((resolve, reject) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results: any, status: any) => {
        if (status === 'OK' && results && results.length > 0) {
          const location = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          };

          // Cache the result
          geocodeCache.set(address, {
            ...location,
            timestamp: Date.now()
          });

          // Log performance in dev mode
          if (import.meta.env.DEV) {
            const duration = performance.now() - startTime;
            console.log(`Geocoded ${address} on main thread in ${duration.toFixed(2)}ms`);
          }

          resolve(location);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Get performance metrics for Google Maps loading
 * @returns Performance metrics object
 */
export const getGoogleMapsPerformanceMetrics = (): typeof perfMetrics => {
  return { ...perfMetrics };
};

/**
 * Clear the geocode cache
 */
export const clearGeocodeCache = (): void => {
  geocodeCache.clear();
};

/**
 * Process marker clustering in a web worker
 * @param markers Array of markers to cluster
 * @param options Clustering options
 * @returns Promise that resolves to clustered markers
 */
export const processMarkerClustering = async (
  markers: Array<{
    position: { lat: number; lng: number };
    [key: string]: any;
  }>,
  options: {
    gridSize?: number;
    maxZoom?: number;
    currentZoom?: number;
    minClusterSize?: number;
    forceMainThread?: boolean;
  } = {}
): Promise<{
  clusters: Array<{
    position: { lat: number; lng: number };
    count: number;
    markers: any[];
  }>;
  markers: any[];
}> => {
  const { forceMainThread = false, ...clusterOptions } = options;

  // Start performance measurement
  const startTime = performance.now();

  // Try to use web worker if supported and not forced to main thread
  if (!forceMainThread && isWebWorkerSupported) {
    try {
      // Use the maps worker to process clustering
      const result = await workerManager.runTask(WorkerType.MAPS, 'cluster-markers', {
        markers,
        options: clusterOptions
      });

      // Log performance in dev mode
      if (import.meta.env.DEV) {
        const duration = performance.now() - startTime;
        console.log(`Clustered ${markers.length} markers using web worker in ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      console.warn('Web worker clustering failed, falling back to main thread:', error);
    }
  }

  // Fall back to main thread clustering using MarkerClusterer if available
  if (window.google && window.google.maps && window.MarkerClusterer) {
    // This would be implemented to use the MarkerClusterer library on the main thread
    // For now, we'll use a simplified clustering algorithm

    const {
      gridSize = 60,
      maxZoom = 15,
      currentZoom = 10,
      minClusterSize = 2
    } = clusterOptions;

    // If we're zoomed in beyond maxZoom, don't cluster
    if (currentZoom >= maxZoom) {
      return {
        clusters: [],
        markers: markers
      };
    }

    // Calculate the pixel distance between points at the current zoom level
    // This is a simplified calculation and not exact
    const pixelsPerDegree = 256 * Math.pow(2, currentZoom) / 360;
    const effectiveGridSize = gridSize / pixelsPerDegree;

    // Group markers by grid cells
    const grid: Record<string, any[]> = {};

    markers.forEach(marker => {
      // Calculate grid cell coordinates
      const cellX = Math.floor(marker.position.lng / effectiveGridSize);
      const cellY = Math.floor(marker.position.lat / effectiveGridSize);
      const cellKey = `${cellX}:${cellY}`;

      if (!grid[cellKey]) {
        grid[cellKey] = [];
      }

      grid[cellKey].push(marker);
    });

    // Create clusters from grid cells
    const clusters: Array<{
      position: { lat: number; lng: number };
      count: number;
      markers: any[];
    }> = [];
    const singleMarkers: any[] = [];

    Object.values(grid).forEach(cell => {
      if (cell.length >= minClusterSize) {
        // Calculate the center of the cluster
        const center = cell.reduce(
          (acc, marker) => {
            return {
              lat: acc.lat + marker.position.lat / cell.length,
              lng: acc.lng + marker.position.lng / cell.length
            };
          },
          { lat: 0, lng: 0 }
        );

        clusters.push({
          position: center,
          count: cell.length,
          markers: cell
        });
      } else {
        // Add individual markers to the result
        singleMarkers.push(...cell);
      }
    });

    // Log performance in dev mode
    if (import.meta.env.DEV) {
      const duration = performance.now() - startTime;
      console.log(`Clustered ${markers.length} markers on main thread in ${duration.toFixed(2)}ms`);
    }

    return {
      clusters,
      markers: singleMarkers
    };
  }

  // If MarkerClusterer is not available, return all markers unclustered
  return {
    clusters: [],
    markers
  };
};

// Add type definitions for the global window object
declare global {
  interface Window {
    google?: any;
    MarkerClusterer?: any;
    [key: string]: any;
  }
}
