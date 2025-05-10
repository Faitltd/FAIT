import React, { useEffect, useRef, useState, useCallback } from 'react';
import { loadGoogleMapsApi, isGoogleMapsLoaded, isGoogleMapsFallbackMode } from '../../utils/googleMapsLoader';
import { AlertCircle, MapPin, Search, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
}

interface Marker {
  id: string;
  position: Location;
  title?: string;
  icon?: string;
  onClick?: () => void;
}

interface EnhancedMapDisplayProps {
  markers?: Marker[];
  center?: Location;
  zoom?: number;
  height?: string | number;
  width?: string | number;
  className?: string;
  onMapClick?: (location: Location) => void;
  onBoundsChanged?: (bounds: any) => void;
  showControls?: boolean;
  allowZoom?: boolean;
  defaultCenter?: Location;
  showFallbackMap?: boolean;
  enableClustering?: boolean;
  clusterOptions?: {
    gridSize?: number;
    maxZoom?: number;
    minClusterSize?: number;
  };
  libraries?: string[];
}

/**
 * Enhanced Map Display Component
 *
 * A robust Google Maps component that handles various edge cases:
 * - Ensures the map is always displayed, even when no markers are present
 * - Properly handles API loading and initialization
 * - Provides fallback UI during loading and when Google Maps fails
 * - Includes error handling and recovery
 * - Supports marker clustering
 * - Fixes the "Cannot read properties of undefined (reading 'aI')" error
 */
const EnhancedMapDisplay: React.FC<EnhancedMapDisplayProps> = ({
  markers = [],
  center,
  zoom = 10,
  height = '400px',
  width = '100%',
  className = '',
  onMapClick,
  onBoundsChanged,
  showControls = true,
  allowZoom = true,
  defaultCenter = { lat: 39.7392, lng: -104.9903 }, // Denver as default
  showFallbackMap = true,
  enableClustering = false,
  clusterOptions = {
    gridSize: 50,
    maxZoom: 15,
    minClusterSize: 2
  },
  libraries = []
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const clustererRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<Location>(center || defaultCenter);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [fallbackMode, setFallbackMode] = useState(false);

  // Initialize the map
  const initializeMap = useCallback(async () => {
    if (!mapRef.current) return;

    try {
      setLoading(true);

      // Check if we're in fallback mode
      if (isGoogleMapsFallbackMode()) {
        console.log('Google Maps in fallback mode, showing fallback UI');
        setFallbackMode(true);
        setLoading(false);
        return;
      }

      // Load Google Maps API if not already loaded
      if (!isGoogleMapsLoaded()) {
        await loadGoogleMapsApi(libraries);
      }

      if (!window.google || !window.google.maps) {
        throw new Error('Google Maps API not available');
      }

      // Create the map instance
      const mapOptions = {
        center: mapCenter,
        zoom: currentZoom,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: showControls && allowZoom,
        scrollwheel: allowZoom,
        gestureHandling: allowZoom ? 'greedy' : 'none',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      };

      // Create the map with error handling
      try {
        const map = new window.google.maps.Map(mapRef.current, mapOptions);
        googleMapRef.current = map;

        // Add click handler if provided
        if (onMapClick) {
          map.addListener('click', (e: any) => {
            if (e.latLng) {
              const clickedLocation = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
              };
              onMapClick(clickedLocation);
            }
          });
        }

        // Add bounds changed handler if provided
        if (onBoundsChanged) {
          map.addListener('bounds_changed', () => {
            const bounds = map.getBounds();
            if (bounds) {
              onBoundsChanged(bounds);
            }
          });
        }

        // Add zoom changed handler
        map.addListener('zoom_changed', () => {
          const newZoom = map.getZoom();
          if (newZoom) {
            setCurrentZoom(newZoom);
          }
        });

        // Add markers
        addMarkers(map);

        setMapLoaded(true);
        setLoading(false);
        setError(null);
      } catch (mapError) {
        console.error('Error creating map instance:', mapError);
        throw new Error(`Failed to create map instance: ${mapError.message}`);
      }
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map. Please try again.');
      setLoading(false);

      // Check if we should show fallback map
      if (showFallbackMap) {
        setFallbackMode(true);
      }
    }
  }, [mapCenter, currentZoom, showControls, allowZoom, onMapClick, onBoundsChanged, libraries, showFallbackMap]);

  // Add markers to the map
  const addMarkers = useCallback((map: any) => {
    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker) marker.setMap(null);
    });
    markersRef.current = [];

    // Clear existing clusterer
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current = null;
    }

    // If no markers, return
    if (!markers || markers.length === 0) return;

    try {
      // Add new markers
      const bounds = new window.google.maps.LatLngBounds();
      const newMarkers = markers.map(marker => {
        const position = new window.google.maps.LatLng(
          marker.position.lat,
          marker.position.lng
        );

        // Extend bounds to include this marker
        bounds.extend(position);

        // Create marker
        const googleMarker = new window.google.maps.Marker({
          position,
          map: map,
          title: marker.title || '',
          icon: marker.icon,
          animation: window.google.maps.Animation.DROP
        });

        // Add click handler
        if (marker.onClick) {
          googleMarker.addListener('click', marker.onClick);
        }

        return googleMarker;
      });

      markersRef.current = newMarkers;

      // If clustering is enabled and MarkerClusterer is available, create a clusterer
      if (enableClustering && window.MarkerClusterer) {
        try {
          clustererRef.current = new window.MarkerClusterer(map, newMarkers, {
            gridSize: clusterOptions.gridSize,
            maxZoom: clusterOptions.maxZoom,
            minimumClusterSize: clusterOptions.minClusterSize
          });
        } catch (err) {
          console.error('Error creating marker clusterer:', err);
        }
      }

      // Fit map to bounds if we have markers and no center is specified
      if (newMarkers.length > 0 && !center) {
        map.fitBounds(bounds);

        // Don't zoom in too far
        const listener = map.addListener('idle', () => {
          if (map.getZoom() && map.getZoom() > 15) {
            map.setZoom(15);
          }
          window.google.maps.event.removeListener(listener);
        });
      }
    } catch (err) {
      console.error('Error adding markers:', err);
    }
  }, [markers, center, enableClustering, clusterOptions]);

  // Initialize map on mount
  useEffect(() => {
    initializeMap();

    // Cleanup function
    return () => {
      // Clear markers
      markersRef.current.forEach(marker => {
        if (marker) marker.setMap(null);
      });
      markersRef.current = [];

      // Clear clusterer
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }
    };
  }, [initializeMap]);

  // Update markers when they change
  useEffect(() => {
    if (!mapLoaded || !googleMapRef.current) return;

    try {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        if (marker) marker.setMap(null);
      });
      markersRef.current = [];

      // Add new markers
      const bounds = new window.google.maps.LatLngBounds();
      const newMarkers = markers.map(marker => {
        const position = new window.google.maps.LatLng(
          marker.position.lat,
          marker.position.lng
        );

        // Extend bounds to include this marker
        bounds.extend(position);

        // Create marker
        const googleMarker = new window.google.maps.Marker({
          position,
          map: googleMapRef.current,
          title: marker.title || '',
          icon: marker.icon,
          animation: window.google.maps.Animation.DROP
        });

        // Add click handler
        if (marker.onClick) {
          googleMarker.addListener('click', marker.onClick);
        }

        return googleMarker;
      });

      markersRef.current = newMarkers;

      // Fit map to bounds if we have markers
      if (markers.length > 0 && !center) {
        googleMapRef.current.fitBounds(bounds);

        // Don't zoom in too far
        const listener = googleMapRef.current.addListener('idle', () => {
          if (googleMapRef.current.getZoom() > 15) {
            googleMapRef.current.setZoom(15);
          }
          window.google.maps.event.removeListener(listener);
        });
      } else if (center) {
        // If center is provided, use it
        googleMapRef.current.setCenter(center);
      }
    } catch (err) {
      console.error('Error updating markers:', err);
    }
  }, [markers, mapLoaded, center]);

  // Update center when it changes
  useEffect(() => {
    if (!mapLoaded || !googleMapRef.current || !center) return;

    try {
      googleMapRef.current.setCenter(center);
      setMapCenter(center);
    } catch (err) {
      console.error('Error updating map center:', err);
    }
  }, [center, mapLoaded]);

  // Update zoom when it changes
  useEffect(() => {
    if (!mapLoaded || !googleMapRef.current || zoom === currentZoom) return;

    try {
      googleMapRef.current.setZoom(zoom);
      setCurrentZoom(zoom);
    } catch (err) {
      console.error('Error updating map zoom:', err);
    }
  }, [zoom, mapLoaded, currentZoom]);

  // Handle zoom in button click
  const handleZoomIn = () => {
    if (!mapLoaded || !googleMapRef.current) return;

    try {
      const newZoom = Math.min(googleMapRef.current.getZoom() + 1, 20);
      googleMapRef.current.setZoom(newZoom);
    } catch (err) {
      console.error('Error zooming in:', err);
    }
  };

  // Handle zoom out button click
  const handleZoomOut = () => {
    if (!mapLoaded || !googleMapRef.current) return;

    try {
      const newZoom = Math.max(googleMapRef.current.getZoom() - 1, 1);
      googleMapRef.current.setZoom(newZoom);
    } catch (err) {
      console.error('Error zooming out:', err);
    }
  };

  // Render fallback map
  const renderFallbackMap = () => {
    return (
      <div
        className={`relative bg-gray-100 border border-gray-200 rounded-lg overflow-hidden ${className}`}
        style={{ height, width }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <MapPin className="w-12 h-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">Map Unavailable</h3>
          <p className="text-sm text-gray-500 max-w-md">
            We're unable to load the interactive map at this time.
            {markers.length > 0 ? (
              <span> There are {markers.length} locations in this area.</span>
            ) : (
              <span> Please try again later.</span>
            )}
          </p>

          {markers.length > 0 && (
            <div className="mt-4 max-h-48 overflow-y-auto w-full max-w-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Locations:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {markers.map((marker, index) => (
                  <li
                    key={marker.id || index}
                    className="p-2 hover:bg-gray-200 rounded cursor-pointer"
                    onClick={marker.onClick}
                  >
                    {marker.title || `Location ${index + 1}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  // If in fallback mode, render fallback map
  if (fallbackMode) {
    return renderFallbackMap();
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Map container */}
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ opacity: mapLoaded ? 1 : 0.4 }}
      />

      {/* Loading indicator */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <div className="bg-white p-4 rounded-lg shadow-md max-w-md text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-red-800 mb-1">Map Error</h3>
            <p className="text-sm text-gray-600 mb-3">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                initializeMap();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* No results message when map is loaded but no markers */}
      {mapLoaded && markers.length === 0 && (
        <div className="absolute top-4 left-0 right-0 mx-auto w-max bg-white py-2 px-4 rounded-full shadow-md">
          <div className="flex items-center text-sm text-gray-600">
            <Search className="h-4 w-4 mr-2 text-gray-400" />
            <span>No locations found. Try adjusting your search or zoom out to explore.</span>
          </div>
        </div>
      )}

      {/* Custom zoom controls */}
      {mapLoaded && showControls && allowZoom && (
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={handleZoomIn}
            className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-5 w-5 text-gray-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedMapDisplay;
