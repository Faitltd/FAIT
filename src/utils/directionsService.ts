/**
 * Utility for Google Maps Directions API
 */
import { loadGoogleMapsApi, isGoogleMapsLoaded } from './googleMapsLoader';

// Available transportation modes
export type TransportMode = 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';

// Direction request options
export interface DirectionsRequest {
  origin: string | google.maps.LatLng | google.maps.Place;
  destination: string | google.maps.LatLng | google.maps.Place;
  travelMode: TransportMode;
  unitSystem?: google.maps.UnitSystem;
  avoidHighways?: boolean;
  avoidTolls?: boolean;
  optimizeWaypoints?: boolean;
  provideRouteAlternatives?: boolean;
  transitOptions?: google.maps.TransitOptions;
  drivingOptions?: google.maps.DrivingOptions;
}

// Cache for directions results
interface CachedDirections {
  result: google.maps.DirectionsResult;
  timestamp: number;
}

// Cache timeout - how long to cache directions results (in milliseconds)
const DIRECTIONS_CACHE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Cache for directions results
const directionsCache = new Map<string, CachedDirections>();

/**
 * Get directions using Google Maps Directions API
 * @param request Directions request options
 * @returns Promise that resolves to the directions result
 */
export const getDirections = async (
  request: DirectionsRequest
): Promise<google.maps.DirectionsResult> => {
  // Make sure Google Maps is loaded
  if (!isGoogleMapsLoaded()) {
    await loadGoogleMapsApi(['places']);
  }

  // Create a cache key from the request
  const cacheKey = createCacheKey(request);

  // Check if we have a cached result
  const cachedResult = directionsCache.get(cacheKey);
  if (cachedResult && Date.now() - cachedResult.timestamp < DIRECTIONS_CACHE_TIMEOUT) {
    console.log('Using cached directions result');
    return cachedResult.result;
  }

  // Create a new directions service
  const directionsService = new google.maps.DirectionsService();

  // Get directions
  return new Promise((resolve, reject) => {
    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        // Cache the result
        directionsCache.set(cacheKey, {
          result,
          timestamp: Date.now(),
        });

        resolve(result);
      } else {
        reject(new Error(`Directions request failed: ${status}`));
      }
    });
  });
};

/**
 * Render directions on a map
 * @param map Google Maps map instance
 * @param directions Directions result
 * @param options Optional renderer options
 * @returns DirectionsRenderer instance
 */
export const renderDirections = (
  map: google.maps.Map,
  directions: google.maps.DirectionsResult,
  options: google.maps.DirectionsRendererOptions = {}
): google.maps.DirectionsRenderer => {
  const renderer = new google.maps.DirectionsRenderer({
    map,
    suppressMarkers: false,
    preserveViewport: false,
    ...options,
  });

  renderer.setDirections(directions);
  return renderer;
};

/**
 * Clear directions from a map
 * @param renderer DirectionsRenderer instance
 */
export const clearDirections = (renderer: google.maps.DirectionsRenderer): void => {
  renderer.setMap(null);
};

/**
 * Create a cache key from a directions request
 * @param request Directions request
 * @returns Cache key string
 */
const createCacheKey = (request: DirectionsRequest): string => {
  const { origin, destination, travelMode } = request;
  
  // Convert origin and destination to strings
  const originStr = typeof origin === 'string' ? origin : JSON.stringify(origin);
  const destinationStr = typeof destination === 'string' ? destination : JSON.stringify(destination);
  
  return `${originStr}|${destinationStr}|${travelMode}`;
};

/**
 * Format duration in seconds to a human-readable string
 * @param seconds Duration in seconds
 * @returns Formatted duration string
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }
  
  return `${minutes} min`;
};

/**
 * Format distance in meters to a human-readable string
 * @param meters Distance in meters
 * @param useImperial Whether to use imperial units (miles)
 * @returns Formatted distance string
 */
export const formatDistance = (meters: number, useImperial = true): string => {
  if (useImperial) {
    const miles = meters / 1609.34;
    return miles >= 10
      ? `${Math.round(miles)} mi`
      : `${miles.toFixed(1)} mi`;
  }
  
  const km = meters / 1000;
  return km >= 10
    ? `${Math.round(km)} km`
    : `${km.toFixed(1)} km`;
};
