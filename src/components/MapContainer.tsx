import React, { useState, useEffect } from 'react';
import { isGoogleMapsLoaded, isGoogleMapsFallbackMode } from '../utils/googleMapsLoader';
import FallbackMap from './FallbackMap';

interface MapContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  fallbackMessage?: string;
}

/**
 * A container component that renders either the Google Maps component
 * or a fallback component if Google Maps fails to load
 */
const MapContainer: React.FC<MapContainerProps> = ({
  children,
  className = '',
  style = {},
  fallbackMessage
}) => {
  const [isMapAvailable, setIsMapAvailable] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check if Google Maps is available or in fallback mode
    const checkMapAvailability = () => {
      if (isGoogleMapsFallbackMode()) {
        console.log('MapContainer: Google Maps in fallback mode');
        setIsMapAvailable(false);
        return;
      }
      
      if (isGoogleMapsLoaded()) {
        console.log('MapContainer: Google Maps is available');
        setIsMapAvailable(true);
        return;
      }
      
      console.log('MapContainer: Google Maps not yet available, will check again');
      setIsMapAvailable(null);
    };
    
    // Check immediately
    checkMapAvailability();
    
    // Set up an interval to check periodically
    const checkInterval = setInterval(checkMapAvailability, 1000);
    
    // Clean up
    return () => {
      clearInterval(checkInterval);
    };
  }, []);
  
  // If we're still checking, show a loading indicator
  if (isMapAvailable === null) {
    return (
      <div 
        className={`map-container-loading ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9f9f9',
          border: '1px solid #eee',
          borderRadius: '4px',
          padding: '20px',
          minHeight: '200px',
          ...style
        }}
      >
        <div className="loading-spinner" style={{ width: '32px', height: '32px' }}>
          <svg 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg" 
            style={{ 
              animation: 'spin 1s linear infinite',
              width: '100%',
              height: '100%',
              fill: '#666'
            }}
          >
            <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
          </svg>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }
  
  // If Google Maps is available, render the children
  if (isMapAvailable) {
    return (
      <div className={`map-container ${className}`} style={style}>
        {children}
      </div>
    );
  }
  
  // If Google Maps is not available, render the fallback
  return (
    <FallbackMap 
      className={className} 
      style={style} 
      message={fallbackMessage}
    />
  );
};

export default MapContainer;
