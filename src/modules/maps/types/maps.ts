import { User, Location } from '../../core/types/common';

/**
 * Map marker interface
 */
export interface MapMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  description?: string;
  icon?: string;
  type: MarkerType;
  data?: any;
}

/**
 * Marker type
 */
export enum MarkerType {
  SERVICE_AGENT = 'service_agent',
  CLIENT = 'client',
  PROJECT = 'project',
  BOOKING = 'booking',
  CUSTOM = 'custom'
}

/**
 * Map bounds interface
 */
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Service area interface
 */
export interface ServiceArea {
  id: string;
  serviceAgentId: string;
  serviceAgent?: User;
  name: string;
  description?: string;
  center: {
    lat: number;
    lng: number;
  };
  radius: number; // in kilometers
  color?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service area polygon interface
 */
export interface ServiceAreaPolygon {
  id: string;
  serviceAgentId: string;
  serviceAgent?: User;
  name: string;
  description?: string;
  paths: Array<{
    lat: number;
    lng: number;
  }>;
  color?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Geocoding result interface
 */
export interface GeocodingResult {
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  formattedAddress?: string;
  addressComponents?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

/**
 * Directions mode
 */
export enum DirectionsMode {
  DRIVING = 'driving',
  WALKING = 'walking',
  BICYCLING = 'bicycling',
  TRANSIT = 'transit'
}

/**
 * Directions result interface
 */
export interface DirectionsResult {
  origin: Location;
  destination: Location;
  distance: {
    text: string;
    value: number; // in meters
  };
  duration: {
    text: string;
    value: number; // in seconds
  };
  mode: DirectionsMode;
  route: Array<{
    lat: number;
    lng: number;
  }>;
  steps?: Array<{
    instruction: string;
    distance: {
      text: string;
      value: number; // in meters
    };
    duration: {
      text: string;
      value: number; // in seconds
    };
    startLocation: {
      lat: number;
      lng: number;
    };
    endLocation: {
      lat: number;
      lng: number;
    };
  }>;
}

/**
 * Saved location interface
 */
export interface SavedLocation {
  id: string;
  userId: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Map settings interface
 */
export interface MapSettings {
  defaultCenter: {
    lat: number;
    lng: number;
  };
  defaultZoom: number;
  mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  showTraffic: boolean;
  showTransit: boolean;
  showBicycling: boolean;
  clusterMarkers: boolean;
  markerSize: 'small' | 'medium' | 'large';
  theme: 'default' | 'dark' | 'light' | 'custom';
}
