/**
 * Get geocode information for an address or zip code
 * @param {string} address - Address or zip code to geocode
 * @returns {Promise<Array>} Geocode results
 */
export const getGeocode = async (address) => {
  try {
    // Check if Google Maps API is loaded
    if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
      throw new Error('Google Maps API not loaded');
    }
    
    const geocoder = new window.google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK') {
          resolve(results);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw error;
  }
};

/**
 * Get latitude and longitude from geocode result
 * @param {Object} geocodeResult - Geocode result
 * @returns {Object} Latitude and longitude
 */
export const getLatLng = (geocodeResult) => {
  if (!geocodeResult || !geocodeResult.geometry || !geocodeResult.geometry.location) {
    throw new Error('Invalid geocode result');
  }
  
  const location = geocodeResult.geometry.location;
  
  return {
    lat: typeof location.lat === 'function' ? location.lat() : location.lat,
    lng: typeof location.lng === 'function' ? location.lng() : location.lng
  };
};

/**
 * Calculate distance between two zip codes
 * @param {string} zipCode1 - First zip code
 * @param {string} zipCode2 - Second zip code
 * @returns {Promise<number>} Distance in miles
 */
export const getDistance = async (zipCode1, zipCode2) => {
  try {
    // If zip codes are the same, distance is 0
    if (zipCode1 === zipCode2) {
      return 0;
    }
    
    // Check if Google Maps API is loaded
    if (!window.google || !window.google.maps || !window.google.maps.DistanceMatrixService) {
      throw new Error('Google Maps API not loaded');
    }
    
    const distanceService = new window.google.maps.DistanceMatrixService();
    
    return new Promise((resolve, reject) => {
      distanceService.getDistanceMatrix(
        {
          origins: [{ postalCode: zipCode1, country: 'US' }],
          destinations: [{ postalCode: zipCode2, country: 'US' }],
          travelMode: 'DRIVING',
          unitSystem: window.google.maps.UnitSystem.IMPERIAL
        },
        (response, status) => {
          if (status === 'OK') {
            if (
              response.rows[0] &&
              response.rows[0].elements[0] &&
              response.rows[0].elements[0].status === 'OK' &&
              response.rows[0].elements[0].distance
            ) {
              // Convert meters to miles
              const distanceInMiles = response.rows[0].elements[0].distance.value / 1609.34;
              resolve(distanceInMiles);
            } else {
              // Fallback to approximate calculation if exact distance can't be determined
              getApproximateDistance(zipCode1, zipCode2)
                .then(resolve)
                .catch(reject);
            }
          } else {
            // Fallback to approximate calculation if API fails
            getApproximateDistance(zipCode1, zipCode2)
              .then(resolve)
              .catch(reject);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error calculating distance:', error);
    // Fallback to approximate calculation if API fails
    return getApproximateDistance(zipCode1, zipCode2);
  }
};

/**
 * Calculate approximate distance between two zip codes using geocoding
 * @param {string} zipCode1 - First zip code
 * @param {string} zipCode2 - Second zip code
 * @returns {Promise<number>} Approximate distance in miles
 */
const getApproximateDistance = async (zipCode1, zipCode2) => {
  try {
    // Get geocode for both zip codes
    const geocode1 = await getGeocode(zipCode1);
    const geocode2 = await getGeocode(zipCode2);
    
    // Get lat/lng for both zip codes
    const latLng1 = getLatLng(geocode1[0]);
    const latLng2 = getLatLng(geocode2[0]);
    
    // Calculate distance using Haversine formula
    return calculateHaversineDistance(latLng1.lat, latLng1.lng, latLng2.lat, latLng2.lng);
  } catch (error) {
    console.error('Error calculating approximate distance:', error);
    // Return a default distance if all else fails
    return 25; // Default to 25 miles
  }
};

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in miles
 */
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};
