/**
 * Web Worker for Google Maps Data Processing
 * 
 * This worker handles computationally intensive tasks related to Google Maps
 * to keep the main thread responsive, including:
 * - Marker clustering calculations
 * - Geocoding result processing
 * - Distance and route calculations
 * - Location data filtering
 */

// Handle messages from the main thread
self.onmessage = function(e) {
  const { id, action, data } = e.data;
  
  try {
    let result;
    
    switch (action) {
      case 'cluster-markers':
        result = clusterMarkers(data.markers, data.options);
        break;
      case 'process-geocoding':
        result = processGeocodingResults(data.results, data.options);
        break;
      case 'calculate-distances':
        result = calculateDistances(data.origin, data.destinations);
        break;
      case 'filter-locations':
        result = filterLocations(data.locations, data.filters);
        break;
      case 'optimize-route':
        result = optimizeRoute(data.waypoints, data.options);
        break;
      case 'generate-heatmap-data':
        result = generateHeatmapData(data.points, data.options);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    // Send the result back to the main thread
    self.postMessage({
      id,
      success: true,
      result
    });
  } catch (error) {
    // Send error back to the main thread
    self.postMessage({
      id,
      success: false,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
};

/**
 * Cluster markers based on proximity
 * 
 * This is a simplified version of marker clustering that can be used
 * when the Google Maps API is not available in the worker.
 */
function clusterMarkers(markers, options = {}) {
  const {
    gridSize = 60,
    maxZoom = 15,
    currentZoom = 10,
    minClusterSize = 2
  } = options;
  
  // If we're zoomed in beyond maxZoom, don't cluster
  if (currentZoom >= maxZoom) {
    return {
      clusters: [],
      markers: markers
    };
  }
  
  // Calculate the pixel distance between points at the current zoom level
  // This is a simplified calculation and not exact
  const pixelsPerDegree = 256 * Math.pow(2, currentZoom) / 360;
  const effectiveGridSize = gridSize / pixelsPerDegree;
  
  // Group markers by grid cells
  const grid = {};
  
  markers.forEach(marker => {
    // Calculate grid cell coordinates
    const cellX = Math.floor(marker.position.lng / effectiveGridSize);
    const cellY = Math.floor(marker.position.lat / effectiveGridSize);
    const cellKey = `${cellX}:${cellY}`;
    
    if (!grid[cellKey]) {
      grid[cellKey] = [];
    }
    
    grid[cellKey].push(marker);
  });
  
  // Create clusters from grid cells
  const clusters = [];
  const singleMarkers = [];
  
  Object.values(grid).forEach(cell => {
    if (cell.length >= minClusterSize) {
      // Calculate the center of the cluster
      const center = cell.reduce(
        (acc, marker) => {
          return {
            lat: acc.lat + marker.position.lat / cell.length,
            lng: acc.lng + marker.position.lng / cell.length
          };
        },
        { lat: 0, lng: 0 }
      );
      
      clusters.push({
        position: center,
        count: cell.length,
        markers: cell
      });
    } else {
      // Add individual markers to the result
      singleMarkers.push(...cell);
    }
  });
  
  return {
    clusters,
    markers: singleMarkers
  };
}

/**
 * Process geocoding results to extract useful information
 */
function processGeocodingResults(results, options = {}) {
  if (!results || !Array.isArray(results) || results.length === 0) {
    return { processed: [], formatted: [] };
  }
  
  const processed = results.map(result => {
    // Extract the components we care about
    const components = {};
    
    if (result.address_components) {
      result.address_components.forEach(component => {
        component.types.forEach(type => {
          components[type] = component.long_name;
          components[`${type}_short`] = component.short_name;
        });
      });
    }
    
    return {
      placeId: result.place_id,
      formattedAddress: result.formatted_address,
      location: result.geometry?.location,
      locationType: result.geometry?.location_type,
      viewport: result.geometry?.viewport,
      components,
      types: result.types || []
    };
  });
  
  // Create a simplified, formatted version
  const formatted = processed.map(item => {
    const { components } = item;
    
    return {
      address: item.formattedAddress,
      coordinates: item.location,
      city: components.locality || components.administrative_area_level_2 || '',
      state: components.administrative_area_level_1_short || '',
      zipCode: components.postal_code || '',
      country: components.country_short || ''
    };
  });
  
  return {
    processed,
    formatted
  };
}

/**
 * Calculate distances between an origin and multiple destinations
 * 
 * This uses the Haversine formula for calculating distances as the crow flies.
 * For actual road distances, you would need to use a routing service.
 */
function calculateDistances(origin, destinations) {
  if (!origin || !destinations || !Array.isArray(destinations)) {
    return [];
  }
  
  return destinations.map(destination => {
    const distance = haversineDistance(origin, destination.position || destination);
    
    return {
      destination,
      distance: {
        value: distance,
        text: formatDistance(distance)
      }
    };
  });
}

/**
 * Calculate the haversine distance between two points
 */
function haversineDistance(point1, point2) {
  const R = 6371; // Earth's radius in km
  
  const dLat = toRadians(point2.lat - point1.lat);
  const dLon = toRadians(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Format a distance in kilometers to a human-readable string
 */
function formatDistance(distance) {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)} km`;
  } else {
    return `${Math.round(distance)} km`;
  }
}

/**
 * Filter locations based on various criteria
 */
function filterLocations(locations, filters = {}) {
  if (!locations || !Array.isArray(locations)) {
    return [];
  }
  
  const {
    radius,
    center,
    bounds,
    keywords = [],
    categories = [],
    priceRange,
    rating
  } = filters;
  
  return locations.filter(location => {
    // Filter by radius if specified
    if (radius && center) {
      const distance = haversineDistance(center, location.position);
      if (distance > radius) {
        return false;
      }
    }
    
    // Filter by bounds if specified
    if (bounds) {
      const { north, south, east, west } = bounds;
      const { lat, lng } = location.position;
      
      if (lat > north || lat < south || lng > east || lng < west) {
        return false;
      }
    }
    
    // Filter by keywords
    if (keywords.length > 0) {
      const locationText = JSON.stringify(location).toLowerCase();
      const matchesKeyword = keywords.some(keyword => 
        locationText.includes(keyword.toLowerCase())
      );
      
      if (!matchesKeyword) {
        return false;
      }
    }
    
    // Filter by categories
    if (categories.length > 0 && location.categories) {
      const matchesCategory = categories.some(category => 
        location.categories.includes(category)
      );
      
      if (!matchesCategory) {
        return false;
      }
    }
    
    // Filter by price range
    if (priceRange && location.price) {
      const { min, max } = priceRange;
      
      if (location.price < min || location.price > max) {
        return false;
      }
    }
    
    // Filter by rating
    if (rating && location.rating) {
      if (location.rating < rating) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Optimize a route by reordering waypoints
 * This is a simple implementation using a greedy algorithm
 */
function optimizeRoute(waypoints, options = {}) {
  if (!waypoints || !Array.isArray(waypoints) || waypoints.length <= 2) {
    return waypoints;
  }
  
  const { startIndex = 0, endIndex = waypoints.length - 1 } = options;
  
  // Keep start and end points fixed if specified
  const start = waypoints[startIndex];
  const end = waypoints[endIndex];
  
  // Get points to optimize (excluding start and end)
  let pointsToOptimize = [...waypoints];
  
  if (startIndex === endIndex) {
    // If start and end are the same, remove just one instance
    pointsToOptimize.splice(startIndex, 1);
  } else {
    // Remove end first (higher index) to avoid index shifting
    if (endIndex > startIndex) {
      pointsToOptimize.splice(endIndex, 1);
      pointsToOptimize.splice(startIndex, 1);
    } else {
      pointsToOptimize.splice(startIndex, 1);
      pointsToOptimize.splice(endIndex, 1);
    }
  }
  
  // Greedy algorithm: always go to the nearest unvisited point
  const optimizedRoute = [start];
  let currentPoint = start;
  
  while (pointsToOptimize.length > 0) {
    // Find the nearest point
    let nearestIndex = 0;
    let nearestDistance = haversineDistance(currentPoint, pointsToOptimize[0]);
    
    for (let i = 1; i < pointsToOptimize.length; i++) {
      const distance = haversineDistance(currentPoint, pointsToOptimize[i]);
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }
    
    // Add the nearest point to the route
    currentPoint = pointsToOptimize[nearestIndex];
    optimizedRoute.push(currentPoint);
    
    // Remove the point from the list
    pointsToOptimize.splice(nearestIndex, 1);
  }
  
  // Add the end point if it's different from the start
  if (startIndex !== endIndex) {
    optimizedRoute.push(end);
  }
  
  return optimizedRoute;
}

/**
 * Generate heatmap data from points
 */
function generateHeatmapData(points, options = {}) {
  if (!points || !Array.isArray(points)) {
    return [];
  }
  
  const { 
    weightProperty = 'weight',
    defaultWeight = 1,
    normalize = false
  } = options;
  
  // Convert points to heatmap format
  let heatmapData = points.map(point => {
    const weight = point[weightProperty] !== undefined 
      ? point[weightProperty] 
      : defaultWeight;
    
    return {
      location: point.position || point,
      weight
    };
  });
  
  // Normalize weights if requested
  if (normalize && heatmapData.length > 0) {
    const weights = heatmapData.map(point => point.weight);
    const maxWeight = Math.max(...weights);
    
    if (maxWeight > 0) {
      heatmapData = heatmapData.map(point => ({
        ...point,
        weight: point.weight / maxWeight
      }));
    }
  }
  
  return heatmapData;
}
