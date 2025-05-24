import { useEffect, useState } from 'react';
import {
  loadGoogleMapsApi,
  isGoogleMapsLoaded,
  isGoogleMapsFallbackMode,
  resetGoogleMapsLoader
} from '../utils/googleMapsLoader';

/**
 * Component that loads the Google Maps API when mounted
 * This is used to preload the API before it's needed
 *
 * Enhanced with retry logic, better error handling, and fallback mode support
 */
const GoogleMapsLoader = () => {
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if already in fallback mode
    if (isGoogleMapsFallbackMode()) {
      console.log('Google Maps already in fallback mode');
      setLoaded(true);
      setFallbackMode(true);
      return;
    }

    // Skip if already loaded
    if (isGoogleMapsLoaded()) {
      console.log('Google Maps already loaded, skipping preload');
      setLoaded(true);
      return;
    }

    // Load the Google Maps API (retry logic is now handled in the utility)
    console.log('Preloading Google Maps API');

    loadGoogleMapsApi()
      .then(() => {
        // Check if we're in fallback mode
        if (isGoogleMapsFallbackMode()) {
          console.log('Google Maps API load resulted in fallback mode');
          setLoaded(true);
          setFallbackMode(true);
        } else {
          console.log('Google Maps API preloaded successfully');
          setLoaded(true);
        }
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to preload Google Maps API', err);
        setError(err instanceof Error ? err : new Error('Unknown error loading Google Maps API'));

        // Check if we're in fallback mode despite the error
        if (isGoogleMapsFallbackMode()) {
          console.log('Google Maps API load error resulted in fallback mode');
          setLoaded(true);
          setFallbackMode(true);
        }
      });

    // Set up an interval to check the load attempts
    const checkInterval = setInterval(() => {
      // This will be updated by the googleMapsLoader utility
      const currentAttempts = loadAttempts + 1;
      setLoadAttempts(currentAttempts);

      // Check if we're in fallback mode
      if (isGoogleMapsFallbackMode()) {
        setFallbackMode(true);
        clearInterval(checkInterval);
      }

      // Check if loaded
      if (isGoogleMapsLoaded()) {
        setLoaded(true);
        clearInterval(checkInterval);
      }
    }, 1000);

    // Cleanup function
    return () => {
      console.log('GoogleMapsLoader component unmounted');
      clearInterval(checkInterval);
    };
  }, []);

  // Function to reset and retry loading
  const handleRetry = () => {
    console.log('Manually retrying Google Maps API load');
    setLoaded(false);
    setFallbackMode(false);
    setLoadAttempts(0);
    setError(null);

    // Reset the loader state
    resetGoogleMapsLoader();

    // Try loading again
    loadGoogleMapsApi([], true)
      .then(() => {
        if (isGoogleMapsFallbackMode()) {
          setFallbackMode(true);
        }
        setLoaded(true);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('Unknown error loading Google Maps API'));
        if (isGoogleMapsFallbackMode()) {
          setFallbackMode(true);
          setLoaded(true);
        }
      });
  };

  // This component doesn't render anything visible in production
  // But we add debug information in development mode
  if (process.env.NODE_ENV === 'development') {
    return (
      <div
        style={{
          display: 'none',
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          zIndex: 9999,
          padding: '10px',
          background: '#f0f0f0',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '12px'
        }}
        data-testid="google-maps-loader"
        data-loaded={loaded}
        data-fallback={fallbackMode}
        data-attempts={loadAttempts}
      >
        <div>Google Maps Loader Status:</div>
        <div>Loaded: {loaded ? 'Yes' : 'No'}</div>
        <div>Fallback Mode: {fallbackMode ? 'Yes' : 'No'}</div>
        <div>Load Attempts: {loadAttempts}</div>
        {error && (
          <div>
            Error: {error.message}
            <button
              onClick={handleRetry}
              style={{
                marginLeft: '10px',
                padding: '2px 5px',
                fontSize: '10px'
              }}
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default GoogleMapsLoader;
