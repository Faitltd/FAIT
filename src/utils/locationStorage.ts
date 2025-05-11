/**
 * Utility for storing and retrieving location data in localStorage
 */

// Key for storing location data in localStorage
const LOCATION_STORAGE_KEY = 'fait_user_location';
const LOCATION_PREFERENCE_KEY = 'fait_remember_location';

// Default expiration time (24 hours)
const DEFAULT_EXPIRATION = 24 * 60 * 60 * 1000;

// Location data interface
export interface StoredLocation {
  zipCode: string;
  lat?: number;
  lng?: number;
  timestamp: number;
  expiration: number;
}

/**
 * Save user location to localStorage
 * @param zipCode User's zip code
 * @param coordinates Optional lat/lng coordinates
 * @param expiration Optional custom expiration time in milliseconds
 */
export const saveUserLocation = (
  zipCode: string,
  coordinates?: { lat: number; lng: number },
  expiration: number = DEFAULT_EXPIRATION
): void => {
  if (!isLocationStorageEnabled()) {
    console.log('Location storage is disabled, not saving location');
    return;
  }

  try {
    const locationData: StoredLocation = {
      zipCode,
      ...(coordinates && { lat: coordinates.lat, lng: coordinates.lng }),
      timestamp: Date.now(),
      expiration,
    };

    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData));
    console.log('User location saved to localStorage:', zipCode);
  } catch (error) {
    console.error('Error saving location to localStorage:', error);
  }
};

/**
 * Get user location from localStorage
 * @returns The stored location or null if not found or expired
 */
export const getUserLocation = (): StoredLocation | null => {
  if (!isLocationStorageEnabled()) {
    console.log('Location storage is disabled, not retrieving location');
    return null;
  }

  try {
    const locationData = localStorage.getItem(LOCATION_STORAGE_KEY);
    
    if (!locationData) {
      return null;
    }

    const parsedData: StoredLocation = JSON.parse(locationData);
    
    // Check if the location data has expired
    if (Date.now() - parsedData.timestamp > parsedData.expiration) {
      console.log('Stored location has expired, removing it');
      localStorage.removeItem(LOCATION_STORAGE_KEY);
      return null;
    }

    return parsedData;
  } catch (error) {
    console.error('Error retrieving location from localStorage:', error);
    return null;
  }
};

/**
 * Clear user location from localStorage
 */
export const clearUserLocation = (): void => {
  try {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    console.log('User location cleared from localStorage');
  } catch (error) {
    console.error('Error clearing location from localStorage:', error);
  }
};

/**
 * Enable location storage preference
 */
export const enableLocationStorage = (): void => {
  try {
    localStorage.setItem(LOCATION_PREFERENCE_KEY, 'true');
    console.log('Location storage enabled');
  } catch (error) {
    console.error('Error enabling location storage:', error);
  }
};

/**
 * Disable location storage preference
 */
export const disableLocationStorage = (): void => {
  try {
    localStorage.setItem(LOCATION_PREFERENCE_KEY, 'false');
    clearUserLocation();
    console.log('Location storage disabled and location cleared');
  } catch (error) {
    console.error('Error disabling location storage:', error);
  }
};

/**
 * Check if location storage is enabled
 * @returns True if location storage is enabled, false otherwise
 */
export const isLocationStorageEnabled = (): boolean => {
  try {
    return localStorage.getItem(LOCATION_PREFERENCE_KEY) === 'true';
  } catch (error) {
    console.error('Error checking location storage preference:', error);
    return false;
  }
};
