/**
 * Web Worker for Heavy Computations
 * 
 * This worker handles computationally intensive tasks to keep the main thread responsive.
 * It supports various computation types and can be extended with additional processors.
 */

// Handle messages from the main thread
self.onmessage = function(e) {
  const { id, type, data, options } = e.data;
  
  try {
    // Process based on computation type
    let result;
    
    switch (type) {
      case 'data-processing':
        result = processData(data, options);
        break;
      case 'image-processing':
        result = processImage(data, options);
        break;
      case 'text-analysis':
        result = analyzeText(data, options);
        break;
      case 'geo-calculations':
        result = performGeoCalculations(data, options);
        break;
      case 'search':
        result = performSearch(data, options);
        break;
      case 'sorting':
        result = sortData(data, options);
        break;
      case 'filtering':
        result = filterData(data, options);
        break;
      case 'statistics':
        result = calculateStatistics(data, options);
        break;
      default:
        throw new Error(`Unknown computation type: ${type}`);
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
 * Process generic data
 */
function processData(data, options = {}) {
  const { operation = 'transform' } = options;
  
  switch (operation) {
    case 'transform':
      return data.map(item => transformItem(item, options));
    case 'aggregate':
      return aggregateData(data, options);
    case 'normalize':
      return normalizeData(data, options);
    default:
      throw new Error(`Unknown data operation: ${operation}`);
  }
}

/**
 * Transform a single data item
 */
function transformItem(item, options = {}) {
  const { transformations = {} } = options;
  const result = { ...item };
  
  // Apply transformations to specified fields
  Object.entries(transformations).forEach(([field, transformation]) => {
    if (typeof transformation === 'function') {
      result[field] = transformation(item[field], item);
    } else if (typeof transformation === 'string') {
      // Handle string-based transformations
      switch (transformation) {
        case 'uppercase':
          result[field] = String(item[field]).toUpperCase();
          break;
        case 'lowercase':
          result[field] = String(item[field]).toLowerCase();
          break;
        case 'trim':
          result[field] = String(item[field]).trim();
          break;
        case 'number':
          result[field] = Number(item[field]);
          break;
        case 'boolean':
          result[field] = Boolean(item[field]);
          break;
        case 'string':
          result[field] = String(item[field]);
          break;
        default:
          // Keep original value
          break;
      }
    }
  });
  
  return result;
}

/**
 * Aggregate data
 */
function aggregateData(data, options = {}) {
  const { groupBy, aggregations = {} } = options;
  
  if (!groupBy) {
    return performAggregations(data, aggregations);
  }
  
  // Group data
  const groups = {};
  
  data.forEach(item => {
    const groupKey = item[groupBy];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
  });
  
  // Perform aggregations on each group
  const result = {};
  
  Object.entries(groups).forEach(([key, items]) => {
    result[key] = performAggregations(items, aggregations);
  });
  
  return result;
}

/**
 * Perform aggregations on a dataset
 */
function performAggregations(data, aggregations) {
  const result = {};
  
  Object.entries(aggregations).forEach(([outputField, config]) => {
    const { field, operation } = config;
    
    switch (operation) {
      case 'sum':
        result[outputField] = data.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
        break;
      case 'avg':
        result[outputField] = data.length > 0
          ? data.reduce((sum, item) => sum + (Number(item[field]) || 0), 0) / data.length
          : 0;
        break;
      case 'min':
        result[outputField] = data.length > 0
          ? Math.min(...data.map(item => Number(item[field]) || 0))
          : 0;
        break;
      case 'max':
        result[outputField] = data.length > 0
          ? Math.max(...data.map(item => Number(item[field]) || 0))
          : 0;
        break;
      case 'count':
        result[outputField] = data.length;
        break;
      case 'countDistinct':
        result[outputField] = new Set(data.map(item => item[field])).size;
        break;
      default:
        result[outputField] = null;
    }
  });
  
  return result;
}

/**
 * Normalize data
 */
function normalizeData(data, options = {}) {
  const { fields = [] } = options;
  
  if (fields.length === 0 || data.length === 0) {
    return data;
  }
  
  // Calculate min and max for each field
  const ranges = {};
  
  fields.forEach(field => {
    const values = data.map(item => Number(item[field]) || 0);
    ranges[field] = {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  });
  
  // Normalize each item
  return data.map(item => {
    const result = { ...item };
    
    fields.forEach(field => {
      const { min, max } = ranges[field];
      const value = Number(item[field]) || 0;
      
      // Avoid division by zero
      if (max === min) {
        result[field] = 0;
      } else {
        result[field] = (value - min) / (max - min);
      }
    });
    
    return result;
  });
}

/**
 * Process image data
 * (Placeholder - would require additional libraries for real implementation)
 */
function processImage(imageData, options = {}) {
  const { operation = 'resize' } = options;
  
  // This is a placeholder - real implementation would use image processing libraries
  return {
    processed: true,
    operation,
    originalSize: imageData.length,
    timestamp: Date.now()
  };
}

/**
 * Analyze text
 */
function analyzeText(text, options = {}) {
  const { operations = ['wordCount'] } = options;
  const result = {};
  
  // Perform requested operations
  operations.forEach(operation => {
    switch (operation) {
      case 'wordCount':
        result.wordCount = countWords(text);
        break;
      case 'sentenceCount':
        result.sentenceCount = countSentences(text);
        break;
      case 'characterCount':
        result.characterCount = text.length;
        break;
      case 'topWords':
        result.topWords = findTopWords(text, options.topWordsCount || 10);
        break;
      case 'sentiment':
        result.sentiment = analyzeSentiment(text);
        break;
      case 'readability':
        result.readability = calculateReadability(text);
        break;
      default:
        // Ignore unknown operations
        break;
    }
  });
  
  return result;
}

/**
 * Count words in text
 */
function countWords(text) {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Count sentences in text
 */
function countSentences(text) {
  return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
}

/**
 * Find top words in text
 */
function findTopWords(text, count = 10) {
  const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
  const wordCounts = {};
  
  words.forEach(word => {
    // Remove punctuation
    const cleanWord = word.replace(/[^\w]/g, '');
    if (cleanWord.length > 0) {
      wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
    }
  });
  
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word, count]) => ({ word, count }));
}

/**
 * Analyze sentiment (very basic implementation)
 */
function analyzeSentiment(text) {
  // This is a very basic implementation
  // Real sentiment analysis would use more sophisticated algorithms
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'best', 'love', 'happy', 'positive', 'beautiful'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'sad', 'negative', 'ugly', 'poor'];
  
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (positiveWords.includes(cleanWord)) {
      positiveCount++;
    } else if (negativeWords.includes(cleanWord)) {
      negativeCount++;
    }
  });
  
  const score = (positiveCount - negativeCount) / (positiveCount + negativeCount + 1);
  
  return {
    score,
    positive: positiveCount,
    negative: negativeCount,
    sentiment: score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral'
  };
}

/**
 * Calculate readability (basic implementation)
 */
function calculateReadability(text) {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  
  if (words.length === 0 || sentences.length === 0) {
    return { score: 0, level: 'unknown' };
  }
  
  // Calculate average words per sentence
  const avgWordsPerSentence = words.length / sentences.length;
  
  // Calculate average word length
  const totalCharacters = words.reduce((sum, word) => sum + word.length, 0);
  const avgWordLength = totalCharacters / words.length;
  
  // Simple readability score (higher is more complex)
  const score = (avgWordsPerSentence * 0.39) + (avgWordLength * 5.8) - 15.59;
  
  // Determine reading level
  let level;
  if (score < 30) {
    level = 'very easy';
  } else if (score < 50) {
    level = 'easy';
  } else if (score < 60) {
    level = 'moderate';
  } else if (score < 70) {
    level = 'difficult';
  } else {
    level = 'very difficult';
  }
  
  return {
    score,
    level,
    avgWordsPerSentence,
    avgWordLength
  };
}

/**
 * Perform geo calculations
 */
function performGeoCalculations(data, options = {}) {
  const { operation = 'distance' } = options;
  
  switch (operation) {
    case 'distance':
      return calculateDistance(data.point1, data.point2);
    case 'midpoint':
      return calculateMidpoint(data.point1, data.point2);
    case 'boundingBox':
      return calculateBoundingBox(data.points);
    case 'isPointInPolygon':
      return isPointInPolygon(data.point, data.polygon);
    default:
      throw new Error(`Unknown geo operation: ${operation}`);
  }
}

/**
 * Calculate distance between two points (Haversine formula)
 */
function calculateDistance(point1, point2) {
  const R = 6371; // Earth radius in km
  
  const dLat = toRadians(point2.lat - point1.lat);
  const dLon = toRadians(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return {
    kilometers: distance,
    miles: distance * 0.621371
  };
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate midpoint between two points
 */
function calculateMidpoint(point1, point2) {
  return {
    lat: (point1.lat + point2.lat) / 2,
    lng: (point1.lng + point2.lng) / 2
  };
}

/**
 * Calculate bounding box for a set of points
 */
function calculateBoundingBox(points) {
  if (!points || points.length === 0) {
    return null;
  }
  
  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLng = points[0].lng;
  let maxLng = points[0].lng;
  
  points.forEach(point => {
    minLat = Math.min(minLat, point.lat);
    maxLat = Math.max(maxLat, point.lat);
    minLng = Math.min(minLng, point.lng);
    maxLng = Math.max(maxLng, point.lng);
  });
  
  return {
    southwest: { lat: minLat, lng: minLng },
    northeast: { lat: maxLat, lng: maxLng },
    center: { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 }
  };
}

/**
 * Check if a point is inside a polygon
 */
function isPointInPolygon(point, polygon) {
  // Ray casting algorithm
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    
    const intersect = ((yi > point.lat) !== (yj > point.lat)) &&
      (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
    
    if (intersect) {
      inside = !inside;
    }
  }
  
  return inside;
}

/**
 * Perform search on data
 */
function performSearch(data, options = {}) {
  const { query, fields = [], fuzzy = false, caseSensitive = false } = options;
  
  if (!query || !data || data.length === 0) {
    return [];
  }
  
  const searchQuery = caseSensitive ? query : query.toLowerCase();
  
  return data.filter(item => {
    // If no fields specified, search all fields
    const searchFields = fields.length > 0 ? fields : Object.keys(item);
    
    return searchFields.some(field => {
      const value = item[field];
      
      if (value === null || value === undefined) {
        return false;
      }
      
      const stringValue = caseSensitive ? String(value) : String(value).toLowerCase();
      
      if (fuzzy) {
        // Simple fuzzy search (contains any part of the query)
        return stringValue.includes(searchQuery);
      } else {
        // Exact match
        return stringValue === searchQuery;
      }
    });
  });
}

/**
 * Sort data
 */
function sortData(data, options = {}) {
  const { sortBy, direction = 'asc', type = 'string' } = options;
  
  if (!sortBy || !data || data.length === 0) {
    return data;
  }
  
  return [...data].sort((a, b) => {
    let valueA = a[sortBy];
    let valueB = b[sortBy];
    
    // Handle null/undefined values
    if (valueA === null || valueA === undefined) {
      return direction === 'asc' ? -1 : 1;
    }
    
    if (valueB === null || valueB === undefined) {
      return direction === 'asc' ? 1 : -1;
    }
    
    // Convert values based on type
    switch (type) {
      case 'number':
        valueA = Number(valueA);
        valueB = Number(valueB);
        break;
      case 'date':
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
        break;
      case 'boolean':
        valueA = Boolean(valueA);
        valueB = Boolean(valueB);
        break;
      default:
        valueA = String(valueA);
        valueB = String(valueB);
    }
    
    // Compare values
    if (valueA < valueB) {
      return direction === 'asc' ? -1 : 1;
    }
    
    if (valueA > valueB) {
      return direction === 'asc' ? 1 : -1;
    }
    
    return 0;
  });
}

/**
 * Filter data
 */
function filterData(data, options = {}) {
  const { filters = [] } = options;
  
  if (!filters || filters.length === 0 || !data || data.length === 0) {
    return data;
  }
  
  return data.filter(item => {
    return filters.every(filter => {
      const { field, operator, value } = filter;
      const itemValue = item[field];
      
      switch (operator) {
        case 'eq':
          return itemValue === value;
        case 'neq':
          return itemValue !== value;
        case 'gt':
          return itemValue > value;
        case 'gte':
          return itemValue >= value;
        case 'lt':
          return itemValue < value;
        case 'lte':
          return itemValue <= value;
        case 'contains':
          return String(itemValue).includes(String(value));
        case 'startsWith':
          return String(itemValue).startsWith(String(value));
        case 'endsWith':
          return String(itemValue).endsWith(String(value));
        case 'in':
          return Array.isArray(value) && value.includes(itemValue);
        case 'nin':
          return Array.isArray(value) && !value.includes(itemValue);
        default:
          return true;
      }
    });
  });
}

/**
 * Calculate statistics
 */
function calculateStatistics(data, options = {}) {
  const { fields = [] } = options;
  
  if (!data || data.length === 0) {
    return {};
  }
  
  // If no fields specified, use all numeric fields
  const statsFields = fields.length > 0 ? fields : Object.keys(data[0]).filter(key => {
    const value = data[0][key];
    return typeof value === 'number' || !isNaN(Number(value));
  });
  
  const result = {};
  
  statsFields.forEach(field => {
    const values = data
      .map(item => Number(item[field]))
      .filter(value => !isNaN(value));
    
    if (values.length === 0) {
      result[field] = {
        count: 0,
        sum: 0,
        avg: 0,
        min: null,
        max: null,
        median: null,
        variance: 0,
        stdDev: 0
      };
      return;
    }
    
    // Sort values for median and percentiles
    const sortedValues = [...values].sort((a, b) => a - b);
    
    // Calculate statistics
    const count = values.length;
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / count;
    const min = sortedValues[0];
    const max = sortedValues[count - 1];
    
    // Median
    const midIndex = Math.floor(count / 2);
    const median = count % 2 === 0
      ? (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2
      : sortedValues[midIndex];
    
    // Variance and standard deviation
    const squaredDiffs = values.map(value => Math.pow(value - avg, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / count;
    const stdDev = Math.sqrt(variance);
    
    result[field] = {
      count,
      sum,
      avg,
      min,
      max,
      median,
      variance,
      stdDev
    };
  });
  
  return result;
}
