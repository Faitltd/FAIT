import { apiService } from '../../core/services/apiService';
import { 
  MapMarker, 
  ServiceArea, 
  ServiceAreaPolygon, 
  GeocodingResult, 
  DirectionsResult, 
  DirectionsMode,
  SavedLocation,
  MapSettings
} from '../types/maps';
import { ApiResponse, PaginatedResult, QueryParams } from '../../core/types/common';

/**
 * Maps service for managing maps-related functionality
 */
class MapsService {
  private baseEndpoint = '/maps';
  private googleMapsApiKey: string = '';

  /**
   * Set Google Maps API key
   */
  setApiKey(apiKey: string): void {
    this.googleMapsApiKey = apiKey;
  }

  /**
   * Get Google Maps API key
   */
  getApiKey(): string {
    return this.googleMapsApiKey;
  }

  /**
   * Get markers
   */
  async getMarkers(params?: QueryParams): Promise<ApiResponse<PaginatedResult<MapMarker>>> {
    return apiService.get<PaginatedResult<MapMarker>>(`${this.baseEndpoint}/markers`, params);
  }

  /**
   * Get service areas
   */
  async getServiceAreas(params?: QueryParams): Promise<ApiResponse<PaginatedResult<ServiceArea>>> {
    return apiService.get<PaginatedResult<ServiceArea>>(`${this.baseEndpoint}/service-areas`, params);
  }

  /**
   * Get service area polygons
   */
  async getServiceAreaPolygons(params?: QueryParams): Promise<ApiResponse<PaginatedResult<ServiceAreaPolygon>>> {
    return apiService.get<PaginatedResult<ServiceAreaPolygon>>(`${this.baseEndpoint}/service-area-polygons`, params);
  }

  /**
   * Get service agent service areas
   */
  async getServiceAgentServiceAreas(serviceAgentId: string): Promise<ApiResponse<ServiceArea[]>> {
    return apiService.get<ServiceArea[]>(`${this.baseEndpoint}/service-agents/${serviceAgentId}/service-areas`);
  }

  /**
   * Create service area
   */
  async createServiceArea(serviceArea: Omit<ServiceArea, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ServiceArea>> {
    return apiService.post<ServiceArea>(`${this.baseEndpoint}/service-areas`, serviceArea);
  }

  /**
   * Update service area
   */
  async updateServiceArea(id: string, serviceArea: Partial<ServiceArea>): Promise<ApiResponse<ServiceArea>> {
    return apiService.put<ServiceArea>(`${this.baseEndpoint}/service-areas/${id}`, serviceArea);
  }

  /**
   * Delete service area
   */
  async deleteServiceArea(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/service-areas/${id}`);
  }

  /**
   * Create service area polygon
   */
  async createServiceAreaPolygon(serviceAreaPolygon: Omit<ServiceAreaPolygon, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ServiceAreaPolygon>> {
    return apiService.post<ServiceAreaPolygon>(`${this.baseEndpoint}/service-area-polygons`, serviceAreaPolygon);
  }

  /**
   * Update service area polygon
   */
  async updateServiceAreaPolygon(id: string, serviceAreaPolygon: Partial<ServiceAreaPolygon>): Promise<ApiResponse<ServiceAreaPolygon>> {
    return apiService.put<ServiceAreaPolygon>(`${this.baseEndpoint}/service-area-polygons/${id}`, serviceAreaPolygon);
  }

  /**
   * Delete service area polygon
   */
  async deleteServiceAreaPolygon(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/service-area-polygons/${id}`);
  }

  /**
   * Geocode address
   */
  async geocodeAddress(address: string): Promise<GeocodingResult> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${this.googleMapsApiKey}`
      );
      
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Geocoding failed: ${data.status}`);
      }
      
      const result = data.results[0];
      
      // Extract address components
      const addressComponents: any = {};
      result.address_components.forEach((component: any) => {
        if (component.types.includes('street_number') || component.types.includes('route')) {
          addressComponents.street = addressComponents.street 
            ? `${addressComponents.street} ${component.long_name}`
            : component.long_name;
        } else if (component.types.includes('locality')) {
          addressComponents.city = component.long_name;
        } else if (component.types.includes('administrative_area_level_1')) {
          addressComponents.state = component.short_name;
        } else if (component.types.includes('postal_code')) {
          addressComponents.zipCode = component.long_name;
        } else if (component.types.includes('country')) {
          addressComponents.country = component.long_name;
        }
      });
      
      return {
        address,
        location: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
        },
        placeId: result.place_id,
        formattedAddress: result.formatted_address,
        addressComponents,
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode
   */
  async reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.googleMapsApiKey}`
      );
      
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Reverse geocoding failed: ${data.status}`);
      }
      
      const result = data.results[0];
      
      // Extract address components
      const addressComponents: any = {};
      result.address_components.forEach((component: any) => {
        if (component.types.includes('street_number') || component.types.includes('route')) {
          addressComponents.street = addressComponents.street 
            ? `${addressComponents.street} ${component.long_name}`
            : component.long_name;
        } else if (component.types.includes('locality')) {
          addressComponents.city = component.long_name;
        } else if (component.types.includes('administrative_area_level_1')) {
          addressComponents.state = component.short_name;
        } else if (component.types.includes('postal_code')) {
          addressComponents.zipCode = component.long_name;
        } else if (component.types.includes('country')) {
          addressComponents.country = component.long_name;
        }
      });
      
      return {
        address: result.formatted_address,
        location: {
          lat,
          lng,
        },
        placeId: result.place_id,
        formattedAddress: result.formatted_address,
        addressComponents,
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }

  /**
   * Get directions
   */
  async getDirections(
    origin: string | { lat: number; lng: number },
    destination: string | { lat: number; lng: number },
    mode: DirectionsMode = DirectionsMode.DRIVING
  ): Promise<DirectionsResult> {
    try {
      // Format origin and destination
      const originStr = typeof origin === 'string' 
        ? origin 
        : `${origin.lat},${origin.lng}`;
      
      const destinationStr = typeof destination === 'string' 
        ? destination 
        : `${destination.lat},${destination.lng}`;
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
          originStr
        )}&destination=${encodeURIComponent(
          destinationStr
        )}&mode=${mode}&key=${this.googleMapsApiKey}`
      );
      
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Directions failed: ${data.status}`);
      }
      
      const route = data.routes[0];
      const leg = route.legs[0];
      
      // Decode polyline
      const decodedPath = this.decodePolyline(route.overview_polyline.points);
      
      // Format steps
      const steps = leg.steps.map((step: any) => ({
        instruction: step.html_instructions,
        distance: step.distance,
        duration: step.duration,
        startLocation: step.start_location,
        endLocation: step.end_location,
      }));
      
      return {
        origin: {
          address: leg.start_address,
          latitude: leg.start_location.lat,
          longitude: leg.start_location.lng,
        },
        destination: {
          address: leg.end_address,
          latitude: leg.end_location.lat,
          longitude: leg.end_location.lng,
        },
        distance: leg.distance,
        duration: leg.duration,
        mode,
        route: decodedPath,
        steps,
      };
    } catch (error) {
      console.error('Directions error:', error);
      throw error;
    }
  }

  /**
   * Decode polyline
   * @see https://developers.google.com/maps/documentation/utilities/polylinealgorithm
   */
  private decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
    const poly: Array<{ lat: number; lng: number }> = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;
    
    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;
      
      shift = 0;
      result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;
      
      poly.push({
        lat: lat / 1e5,
        lng: lng / 1e5,
      });
    }
    
    return poly;
  }

  /**
   * Get saved locations
   */
  async getSavedLocations(): Promise<ApiResponse<SavedLocation[]>> {
    return apiService.get<SavedLocation[]>(`${this.baseEndpoint}/saved-locations`);
  }

  /**
   * Create saved location
   */
  async createSavedLocation(location: Omit<SavedLocation, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SavedLocation>> {
    return apiService.post<SavedLocation>(`${this.baseEndpoint}/saved-locations`, location);
  }

  /**
   * Update saved location
   */
  async updateSavedLocation(id: string, location: Partial<SavedLocation>): Promise<ApiResponse<SavedLocation>> {
    return apiService.put<SavedLocation>(`${this.baseEndpoint}/saved-locations/${id}`, location);
  }

  /**
   * Delete saved location
   */
  async deleteSavedLocation(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/saved-locations/${id}`);
  }

  /**
   * Get map settings
   */
  async getMapSettings(): Promise<ApiResponse<MapSettings>> {
    return apiService.get<MapSettings>(`${this.baseEndpoint}/settings`);
  }

  /**
   * Update map settings
   */
  async updateMapSettings(settings: Partial<MapSettings>): Promise<ApiResponse<MapSettings>> {
    return apiService.put<MapSettings>(`${this.baseEndpoint}/settings`, settings);
  }
}

// Create and export a singleton instance
export const mapsService = new MapsService();
