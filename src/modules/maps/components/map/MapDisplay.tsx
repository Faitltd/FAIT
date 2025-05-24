import React, { useRef, useEffect, useState } from 'react';
import { useMap } from '../../hooks/useMap';
import { MapMarker, MarkerType } from '../../types/maps';
import { LoadingSpinner } from '../../../core/components/common/LoadingSpinner';

export interface MapDisplayProps {
  apiKey: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  markers?: Omit<MapMarker, 'id'>[];
  height?: string;
  width?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (event: google.maps.MapMouseEvent) => void;
  onBoundsChanged?: (bounds: google.maps.LatLngBounds) => void;
  className?: string;
}

/**
 * MapDisplay component for displaying a Google Map
 */
export const MapDisplay: React.FC<MapDisplayProps> = ({
  apiKey,
  initialCenter = { lat: 37.7749, lng: -122.4194 }, // San Francisco
  initialZoom = 12,
  markers = [],
  height = '500px',
  width = '100%',
  onMarkerClick,
  onMapClick,
  onBoundsChanged,
  className,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isScriptError, setIsScriptError] = useState<string | null>(null);
  
  const {
    map,
    addMarker,
    selectMarker,
    selectedMarker,
    isLoading,
    error,
  } = useMap(apiKey);

  // Load Google Maps script
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsScriptLoaded(true);
      return;
    }
    
    const googleMapsScript = document.createElement('script');
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initMap`;
    googleMapsScript.async = true;
    googleMapsScript.defer = true;
    
    window.initMap = () => {
      setIsScriptLoaded(true);
    };
    
    googleMapsScript.onerror = () => {
      setIsScriptError('Failed to load Google Maps script');
    };
    
    document.head.appendChild(googleMapsScript);
    
    return () => {
      window.initMap = undefined;
      document.head.removeChild(googleMapsScript);
    };
  }, [apiKey]);

  // Initialize map
  useEffect(() => {
    if (isScriptLoaded && mapRef.current && !map) {
      const mapOptions: google.maps.MapOptions = {
        center: initialCenter,
        zoom: initialZoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        fullscreenControl: true,
        streetViewControl: true,
        mapTypeControl: true,
        zoomControl: true,
      };
      
      const newMap = new google.maps.Map(mapRef.current, mapOptions);
      
      // Add click event listener
      if (onMapClick) {
        newMap.addListener('click', onMapClick);
      }
      
      // Add bounds changed event listener
      if (onBoundsChanged) {
        newMap.addListener('bounds_changed', () => {
          const bounds = newMap.getBounds();
          if (bounds) {
            onBoundsChanged(bounds);
          }
        });
      }
    }
  }, [isScriptLoaded, map, initialCenter, initialZoom, onMapClick, onBoundsChanged]);

  // Add markers
  useEffect(() => {
    if (map && markers.length > 0) {
      markers.forEach((marker) => {
        const newMarker = addMarker(marker);
        
        // Add click event listener
        if (onMarkerClick) {
          google.maps.event.addListener(
            // @ts-ignore - Google Maps types are not fully compatible
            map.getMarkers().find((m: any) => m.id === newMarker.id),
            'click',
            () => onMarkerClick(newMarker)
          );
        }
      });
    }
  }, [map, markers, addMarker, onMarkerClick]);

  // Handle selected marker
  useEffect(() => {
    if (selectedMarker && onMarkerClick) {
      onMarkerClick(selectedMarker);
    }
  }, [selectedMarker, onMarkerClick]);

  if (isScriptError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {isScriptError}</span>
      </div>
    );
  }

  if (!isScriptLoaded) {
    return (
      <div 
        style={{ height, width }} 
        className={`flex items-center justify-center bg-gray-100 ${className || ''}`}
      >
        <LoadingSpinner size="lg" message="Loading Google Maps..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      style={{ height, width }} 
      className={`relative ${className || ''}`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
};
