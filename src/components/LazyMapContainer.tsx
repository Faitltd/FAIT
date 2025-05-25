import React, { useState, useEffect, useRef } from 'react';
import { loadGoogleMapsApi } from '../utils/googleMapsLoader';
import MapContainer from './MapContainer';

interface LazyMapContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  fallbackMessage?: string;
  threshold?: number;
  rootMargin?: string;
  loadImmediately?: boolean;
  onMapLoad?: () => void;
}

/**
 * A container component that lazily loads Google Maps only when
 * the component is about to enter the viewport
 */
const LazyMapContainer: React.FC<LazyMapContainerProps> = ({
  children,
  className = '',
  style = {},
  fallbackMessage,
  threshold = 0.1,
  rootMargin = '200px 0px',
  loadImmediately = false,
  onMapLoad
}) => {
  const [shouldLoadMap, setShouldLoadMap] = useState(loadImmediately);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set up intersection observer to detect when the map is about to be visible
  useEffect(() => {
    if (loadImmediately) {
      return; // Skip observer if we're loading immediately
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // If the container is about to enter the viewport, load the map
        if (entries[0].isIntersecting) {
          setShouldLoadMap(true);
          // Disconnect the observer once we've decided to load the map
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [loadImmediately, threshold, rootMargin]);

  // Load Google Maps API when shouldLoadMap becomes true
  useEffect(() => {
    if (shouldLoadMap && !isLoaded && !isLoading) {
      setIsLoading(true);
      
      // Start performance measurement
      const startTime = performance.now();
      
      // Load Google Maps API with places library
      loadGoogleMapsApi(['places'])
        .then(() => {
          setIsLoaded(true);
          setIsLoading(false);
          
          // End performance measurement
          const loadTime = performance.now() - startTime;
          console.log(`Google Maps loaded in ${loadTime.toFixed(2)}ms`);
          
          if (onMapLoad) {
            onMapLoad();
          }
        })
        .catch((err) => {
          setError(`Failed to load Google Maps: ${err.message || 'Unknown error'}`);
          setIsLoading(false);
        });
    }
  }, [shouldLoadMap, isLoaded, isLoading, onMapLoad]);

  // If we haven't decided to load the map yet, show a placeholder
  if (!shouldLoadMap) {
    return (
      <div 
        ref={containerRef}
        className={`lazy-map-placeholder ${className}`}
        style={{
          backgroundColor: '#f9f9f9',
          border: '1px solid #eee',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          ...style
        }}
      >
        <div className="text-center p-4">
          <div className="text-gray-400 mb-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <p className="text-sm text-gray-500">Map will load when scrolled into view</p>
        </div>
      </div>
    );
  }

  // If there was an error loading the map, show an error message
  if (error) {
    return (
      <div 
        className={`lazy-map-error ${className}`}
        style={{
          backgroundColor: '#fff5f5',
          border: '1px solid #feb2b2',
          borderRadius: '4px',
          padding: '16px',
          ...style
        }}
      >
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <p className="text-sm text-red-600">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setShouldLoadMap(true);
            }}
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If we're loading the map, show a loading indicator
  if (isLoading) {
    return (
      <div 
        className={`lazy-map-loading ${className}`}
        style={{
          backgroundColor: '#f9f9f9',
          border: '1px solid #eee',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          ...style
        }}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-sm text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  // If the map is loaded, render the MapContainer with children
  return (
    <MapContainer
      className={className}
      style={style}
      fallbackMessage={fallbackMessage}
    >
      {children}
    </MapContainer>
  );
};

export default LazyMapContainer;
