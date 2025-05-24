import React, { useEffect, useState, useRef } from 'react';
import { loadGoogleMapsApi, isGoogleMapsLoaded } from '../utils/googleMapsLoader';

const GoogleMapsTest: React.FC = () => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('GoogleMapsTest component mounted');

    // Log the API key (only first few characters for security)
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    if (key) {
      setApiKey(`${key.substring(0, 8)}...`);
      console.log(`API Key found: ${key.substring(0, 8)}...`);
    } else {
      setApiKey('Not found');
      console.error('API Key not found in environment variables');
      setDebugInfo(prev => prev + '\nAPI Key not found in environment variables');
    }

    // Check if already loaded
    if (isGoogleMapsLoaded()) {
      console.log('Google Maps already loaded according to isGoogleMapsLoaded()');
      setMapLoaded(true);
      setDebugInfo(prev => prev + '\nGoogle Maps already loaded');
      setTimeout(initializeMap, 100); // Small delay to ensure DOM is ready
      return;
    }

    console.log('Attempting to load Google Maps API...');
    setDebugInfo(prev => prev + '\nAttempting to load Google Maps API...');

    // Load Google Maps API
    loadGoogleMapsApi(['places'])
      .then(() => {
        console.log('Google Maps API loaded successfully via promise');
        setMapLoaded(true);
        setDebugInfo(prev => prev + '\nGoogle Maps API loaded successfully');
        setTimeout(initializeMap, 100); // Small delay to ensure DOM is ready
      })
      .catch((err) => {
        console.error('Failed to load Google Maps API', err);
        setError(err instanceof Error ? err.message : 'Failed to load Google Maps API');
        setDebugInfo(prev => prev + '\nFailed to load Google Maps API: ' + (err instanceof Error ? err.message : 'Unknown error'));
      });
  }, []);

  // Initialize the map
  const initializeMap = () => {
    console.log('initializeMap called');
    console.log('mapRef exists:', !!mapRef.current);
    console.log('window.google exists:', !!window.google);
    console.log('window.google.maps exists:', !!(window.google && window.google.maps));

    setDebugInfo(prev => prev +
      `\nmapRef exists: ${!!mapRef.current}` +
      `\nwindow.google exists: ${!!window.google}` +
      `\nwindow.google.maps exists: ${!!(window.google && window.google.maps)}`
    );

    if (!mapRef.current) {
      const errMsg = 'Map container reference is not available';
      console.error(errMsg);
      setError(errMsg);
      setDebugInfo(prev => prev + '\n' + errMsg);
      return;
    }

    if (!window.google || !window.google.maps) {
      const errMsg = 'Google Maps API is not properly loaded';
      console.error(errMsg);
      setError(errMsg);
      setDebugInfo(prev => prev + '\n' + errMsg);
      return;
    }

    try {
      console.log('Creating map instance');
      setDebugInfo(prev => prev + '\nCreating map instance');

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 39.7392, lng: -104.9903 }, // Denver coordinates
        zoom: 10,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP
      });

      // Add a marker for Denver
      const marker = new window.google.maps.Marker({
        position: { lat: 39.7392, lng: -104.9903 },
        map,
        title: 'Denver, CO'
      });

      console.log('Map initialized successfully');
      setDebugInfo(prev => prev + '\nMap initialized successfully');
    } catch (err) {
      console.error('Error initializing map', err);
      const errMsg = 'Error initializing map: ' + (err instanceof Error ? err.message : 'Unknown error');
      setError(errMsg);
      setDebugInfo(prev => prev + '\n' + errMsg);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Google Maps API Test</h2>

      <div className="mb-4">
        <p><strong>API Key:</strong> {apiKey}</p>
        <p><strong>Status:</strong> {mapLoaded ? 'Loaded' : error ? 'Error' : 'Loading...'}</p>
        {error && <p className="text-red-500">{error}</p>}
      </div>

      <div
        ref={mapRef}
        className="w-full h-[400px] border border-gray-300 rounded-md"
        style={{ display: mapLoaded && !error ? 'block' : 'none' }}
      ></div>

      {!mapLoaded && !error && (
        <div className="w-full h-[400px] border border-gray-300 rounded-md flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="w-full h-[400px] border border-red-300 rounded-md flex items-center justify-center bg-red-50">
          <p className="text-red-500 text-center p-4">{error}</p>
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Debug Information:</h3>
        <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-auto max-h-[300px] whitespace-pre-wrap">
          {debugInfo || 'No debug information available'}
        </pre>

        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reload Page
          </button>
          <button
            onClick={() => {
              setError(null);
              setMapLoaded(false);
              setDebugInfo('Manually retrying...');

              loadGoogleMapsApi(['places'])
                .then(() => {
                  setMapLoaded(true);
                  setDebugInfo(prev => prev + '\nGoogle Maps API loaded successfully on retry');
                  setTimeout(initializeMap, 100);
                })
                .catch(err => {
                  setError(err instanceof Error ? err.message : 'Failed to load Google Maps API on retry');
                  setDebugInfo(prev => prev + '\nRetry failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
                });
            }}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Retry Loading Maps
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsTest;
