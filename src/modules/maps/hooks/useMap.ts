import { useState, useEffect, useCallback, useRef } from 'react';
import { mapsService } from '../services/mapsService';
import { 
  MapMarker, 
  ServiceArea, 
  GeocodingResult, 
  DirectionsResult, 
  DirectionsMode,
  SavedLocation,
  MapSettings
} from '../types/maps';

interface UseMapResult {
  map: google.maps.Map | null;
  markers: MapMarker[];
  serviceAreas: ServiceArea[];
  selectedMarker: MapMarker | null;
  isLoading: boolean;
  error: string | null;
  directionsResult: DirectionsResult | null;
  savedLocations: SavedLocation[];
  mapSettings: MapSettings | null;
  initMap: (element: HTMLElement, options?: google.maps.MapOptions) => void;
  addMarker: (marker: Omit<MapMarker, 'id'>) => MapMarker;
  removeMarker: (markerId: string) => void;
  selectMarker: (markerId: string) => void;
  clearMarkers: () => void;
  panTo: (position: google.maps.LatLngLiteral) => void;
  setZoom: (zoom: number) => void;
  getBounds: () => google.maps.LatLngBounds | null;
  geocodeAddress: (address: string) => Promise<GeocodingResult>;
  reverseGeocode: (lat: number, lng: number) => Promise<GeocodingResult>;
  getDirections: (
    origin: string | google.maps.LatLngLiteral,
    destination: string | google.maps.LatLngLiteral,
    mode?: DirectionsMode
  ) => Promise<DirectionsResult>;
  saveLocation: (location: Omit<SavedLocation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<SavedLocation>;
  deleteSavedLocation: (locationId: string) => Promise<void>;
  updateMapSettings: (settings: Partial<MapSettings>) => Promise<MapSettings>;
}

/**
 * Hook for managing Google Maps
 */
export function useMap(apiKey?: string): UseMapResult {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [directionsResult, setDirectionsResult] = useState<DirectionsResult | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [mapSettings, setMapSettings] = useState<MapSettings | null>(null);
  
  // Refs for Google Maps objects
  const googleMarkers = useRef<Map<string, google.maps.Marker>>(new Map());
  const googleServiceAreas = useRef<Map<string, google.maps.Circle>>(new Map());
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  
  // Set API key if provided
  useEffect(() => {
    if (apiKey) {
      mapsService.setApiKey(apiKey);
    }
  }, [apiKey]);

  // Initialize map
  const initMap = useCallback((element: HTMLElement, options?: google.maps.MapOptions) => {
    // Default options
    const defaultOptions: google.maps.MapOptions = {
      center: { lat: 37.7749, lng: -122.4194 }, // San Francisco
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      fullscreenControl: true,
      streetViewControl: true,
      mapTypeControl: true,
      zoomControl: true,
    };
    
    // Create map
    const newMap = new google.maps.Map(element, { ...defaultOptions, ...options });
    setMap(newMap);
    
    // Load saved locations
    fetchSavedLocations();
    
    // Load map settings
    fetchMapSettings();
    
    return newMap;
  }, []);

  // Fetch saved locations
  const fetchSavedLocations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await mapsService.getSavedLocations();
      setSavedLocations(response.data);
    } catch (err) {
      console.error('Error fetching saved locations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch saved locations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch map settings
  const fetchMapSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await mapsService.getMapSettings();
      setMapSettings(response.data);
    } catch (err) {
      console.error('Error fetching map settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch map settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add marker
  const addMarker = useCallback((marker: Omit<MapMarker, 'id'>): MapMarker => {
    if (!map) {
      throw new Error('Map not initialized');
    }
    
    // Create a unique ID for the marker
    const id = `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create the marker object
    const newMarker: MapMarker = {
      ...marker,
      id,
    };
    
    // Create Google Maps marker
    const googleMarker = new google.maps.Marker({
      position: newMarker.position,
      map,
      title: newMarker.title,
      icon: newMarker.icon,
    });
    
    // Add click event listener
    googleMarker.addListener('click', () => {
      setSelectedMarker(newMarker);
    });
    
    // Store the Google Maps marker
    googleMarkers.current.set(id, googleMarker);
    
    // Update markers state
    setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
    
    return newMarker;
  }, [map]);

  // Remove marker
  const removeMarker = useCallback((markerId: string) => {
    // Get the Google Maps marker
    const googleMarker = googleMarkers.current.get(markerId);
    
    if (googleMarker) {
      // Remove the marker from the map
      googleMarker.setMap(null);
      
      // Remove from the ref
      googleMarkers.current.delete(markerId);
      
      // Update markers state
      setMarkers((prevMarkers) => prevMarkers.filter((marker) => marker.id !== markerId));
      
      // If the removed marker was selected, deselect it
      if (selectedMarker?.id === markerId) {
        setSelectedMarker(null);
      }
    }
  }, [selectedMarker]);

  // Select marker
  const selectMarker = useCallback((markerId: string) => {
    const marker = markers.find((m) => m.id === markerId);
    
    if (marker) {
      setSelectedMarker(marker);
      
      // Pan to the marker
      if (map) {
        map.panTo(marker.position);
      }
    }
  }, [markers, map]);

  // Clear markers
  const clearMarkers = useCallback(() => {
    // Remove all markers from the map
    googleMarkers.current.forEach((marker) => {
      marker.setMap(null);
    });
    
    // Clear the ref
    googleMarkers.current.clear();
    
    // Update markers state
    setMarkers([]);
    
    // Deselect marker
    setSelectedMarker(null);
  }, []);

  // Pan to position
  const panTo = useCallback((position: google.maps.LatLngLiteral) => {
    if (map) {
      map.panTo(position);
    }
  }, [map]);

  // Set zoom
  const setZoom = useCallback((zoom: number) => {
    if (map) {
      map.setZoom(zoom);
    }
  }, [map]);

  // Get bounds
  const getBounds = useCallback((): google.maps.LatLngBounds | null => {
    if (map) {
      return map.getBounds() || null;
    }
    return null;
  }, [map]);

  // Geocode address
  const geocodeAddress = useCallback(async (address: string): Promise<GeocodingResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await mapsService.geocodeAddress(address);
      return result;
    } catch (err) {
      console.error('Error geocoding address:', err);
      setError(err instanceof Error ? err.message : 'Failed to geocode address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reverse geocode
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<GeocodingResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await mapsService.reverseGeocode(lat, lng);
      return result;
    } catch (err) {
      console.error('Error reverse geocoding:', err);
      setError(err instanceof Error ? err.message : 'Failed to reverse geocode');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get directions
  const getDirections = useCallback(
    async (
      origin: string | google.maps.LatLngLiteral,
      destination: string | google.maps.LatLngLiteral,
      mode: DirectionsMode = DirectionsMode.DRIVING
    ): Promise<DirectionsResult> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await mapsService.getDirections(origin, destination, mode);
        
        // Store the result
        setDirectionsResult(result);
        
        // If map is initialized, display the route
        if (map) {
          // Clear previous directions
          if (directionsRenderer.current) {
            directionsRenderer.current.setMap(null);
          }
          
          // Create new directions renderer
          directionsRenderer.current = new google.maps.DirectionsRenderer({
            map,
            suppressMarkers: false,
            preserveViewport: false,
          });
          
          // Create directions service
          const directionsService = new google.maps.DirectionsService();
          
          // Create request
          const request: google.maps.DirectionsRequest = {
            origin: typeof origin === 'string' ? origin : new google.maps.LatLng(origin.lat, origin.lng),
            destination: typeof destination === 'string' ? destination : new google.maps.LatLng(destination.lat, destination.lng),
            travelMode: mode as unknown as google.maps.TravelMode,
          };
          
          // Get directions
          directionsService.route(request, (response, status) => {
            if (status === google.maps.DirectionsStatus.OK && directionsRenderer.current) {
              directionsRenderer.current.setDirections(response);
            }
          });
        }
        
        return result;
      } catch (err) {
        console.error('Error getting directions:', err);
        setError(err instanceof Error ? err.message : 'Failed to get directions');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [map]
  );

  // Save location
  const saveLocation = useCallback(
    async (location: Omit<SavedLocation, 'id' | 'createdAt' | 'updatedAt'>): Promise<SavedLocation> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await mapsService.createSavedLocation(location);
        
        // Update saved locations
        setSavedLocations((prevLocations) => [...prevLocations, response.data]);
        
        return response.data;
      } catch (err) {
        console.error('Error saving location:', err);
        setError(err instanceof Error ? err.message : 'Failed to save location');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Delete saved location
  const deleteSavedLocation = useCallback(async (locationId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await mapsService.deleteSavedLocation(locationId);
      
      // Update saved locations
      setSavedLocations((prevLocations) => prevLocations.filter((location) => location.id !== locationId));
    } catch (err) {
      console.error('Error deleting saved location:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete saved location');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update map settings
  const updateMapSettings = useCallback(async (settings: Partial<MapSettings>): Promise<MapSettings> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await mapsService.updateMapSettings(settings);
      
      // Update map settings
      setMapSettings(response.data);
      
      // Apply settings to map
      if (map && response.data) {
        // Apply center
        if (settings.defaultCenter) {
          map.setCenter(settings.defaultCenter);
        }
        
        // Apply zoom
        if (settings.defaultZoom) {
          map.setZoom(settings.defaultZoom);
        }
        
        // Apply map type
        if (settings.mapType) {
          map.setMapTypeId(settings.mapType as unknown as google.maps.MapTypeId);
        }
        
        // Apply traffic layer
        if (settings.showTraffic !== undefined) {
          const trafficLayer = new google.maps.TrafficLayer();
          trafficLayer.setMap(settings.showTraffic ? map : null);
        }
        
        // Apply transit layer
        if (settings.showTransit !== undefined) {
          const transitLayer = new google.maps.TransitLayer();
          transitLayer.setMap(settings.showTransit ? map : null);
        }
        
        // Apply bicycling layer
        if (settings.showBicycling !== undefined) {
          const bicyclingLayer = new google.maps.BicyclingLayer();
          bicyclingLayer.setMap(settings.showBicycling ? map : null);
        }
      }
      
      return response.data;
    } catch (err) {
      console.error('Error updating map settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update map settings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [map]);

  return {
    map,
    markers,
    serviceAreas,
    selectedMarker,
    isLoading,
    error,
    directionsResult,
    savedLocations,
    mapSettings,
    initMap,
    addMarker,
    removeMarker,
    selectMarker,
    clearMarkers,
    panTo,
    setZoom,
    getBounds,
    geocodeAddress,
    reverseGeocode,
    getDirections,
    saveLocation,
    deleteSavedLocation,
    updateMapSettings,
  };
}
