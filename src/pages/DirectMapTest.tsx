import React, { useEffect, useRef, useState } from 'react';

const DirectMapTest: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Get API key from environment
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (key) {
      setApiKey(`${key.substring(0, 8)}...`);
    } else {
      setError('API key not found in environment variables');
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=initMap&libraries=places`;
    script.async = true;
    script.defer = true;
    
    // Define callback function
    window.initMap = () => {
      console.log('Google Maps API loaded via callback');
      setMapLoaded(true);
      
      if (mapRef.current) {
        try {
          const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: 39.7392, lng: -104.9903 }, // Denver coordinates
            zoom: 10,
          });
          
          // Add a marker for Denver
          new window.google.maps.Marker({
            position: { lat: 39.7392, lng: -104.9903 },
            map,
            title: 'Denver, CO'
          });
          
          console.log('Map initialized successfully');
        } catch (err) {
          console.error('Error initializing map', err);
          setError(`Error initializing map: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      } else {
        setError('Map container reference is not available');
      }
    };
    
    // Handle errors
    script.onerror = () => {
      setError('Failed to load Google Maps API script');
    };
    
    // Add script to document
    document.head.appendChild(script);
    
    // Cleanup
    return () => {
      // Remove the callback
      delete window.initMap;
      
      // Remove the script tag
      const scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src.includes('maps.googleapis.com')) {
          scripts[i].parentNode?.removeChild(scripts[i]);
          break;
        }
      }
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Direct Google Maps API Test</h2>
      
      <div className="mb-4">
        <p><strong>API Key:</strong> {apiKey}</p>
        <p><strong>Status:</strong> {mapLoaded ? 'Loaded' : error ? 'Error' : 'Loading...'}</p>
        {error && <p className="text-red-500">{error}</p>}
      </div>
      
      <div
        ref={mapRef}
        className="w-full h-[400px] border-2 border-red-500 rounded-md flex items-center justify-center"
      >
        {!mapLoaded && !error && (
          <div className="text-center p-4 bg-gray-100 rounded-lg">
            <p className="text-lg font-medium">Loading Map...</p>
            <div className="mt-2 animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="font-medium text-red-800 mb-2">Troubleshooting Steps:</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Check if the API key is correct in your .env file</li>
            <li>Verify that the Google Maps JavaScript API is enabled in your Google Cloud Console</li>
            <li>Check if there are any restrictions on your API key that might be preventing it from working</li>
            <li>Look for any JavaScript errors in the browser console</li>
          </ul>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      )}
    </div>
  );
};

// Add type definitions for the global window object
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default DirectMapTest;
