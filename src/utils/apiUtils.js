/**
 * API utilities for resilient data fetching
 */
import { trackError } from './errorTracking';

// Default retry configuration
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 300, // ms
  maxDelay: 5000, // ms
  factor: 2, // exponential backoff factor
  retryOnStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Fetch with automatic retries using exponential backoff
 * 
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {Object} retryConfig - Retry configuration
 * @returns {Promise<Response>} - The fetch response
 */
export const fetchWithRetry = async (
  url,
  options = {},
  retryConfig = {}
) => {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  let lastError;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If the response is ok or it's not a status we want to retry on, return it
      if (
        response.ok ||
        !config.retryOnStatusCodes.includes(response.status)
      ) {
        return response;
      }
      
      // Otherwise, treat it as an error to retry
      lastError = new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      lastError.status = response.status;
      lastError.response = response;
      
    } catch (error) {
      lastError = error;
    }
    
    // If this was the last attempt, throw the error
    if (attempt === config.maxRetries) {
      trackError({
        type: 'api',
        message: `API request failed after ${config.maxRetries} retries: ${lastError.message}`,
        url,
        error: lastError,
        timestamp: new Date().toISOString()
      });
      throw lastError;
    }
    
    // Calculate delay with exponential backoff and jitter
    const delay = Math.min(
      config.initialDelay * Math.pow(config.factor, attempt) * (0.8 + Math.random() * 0.4),
      config.maxDelay
    );
    
    // Wait before the next retry
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  // This should never happen due to the throw in the loop
  throw lastError;
};

/**
 * Wrapper for API calls with consistent error handling
 * 
 * @param {Function} apiCall - The API call function to execute
 * @param {Object} options - Options for error handling
 * @returns {Promise<any>} - The API response data
 */
export const safeApiCall = async (
  apiCall,
  {
    fallbackData = null,
    onError = null,
    retryConfig = DEFAULT_RETRY_CONFIG,
  } = {}
) => {
  try {
    return await apiCall();
  } catch (error) {
    trackError({
      type: 'api',
      message: `API call failed: ${error.message}`,
      error,
      timestamp: new Date().toISOString()
    });
    
    if (onError) {
      onError(error);
    }
    
    return fallbackData;
  }
};

/**
 * Creates a debounced version of a function
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce wait time in ms
 * @returns {Function} - The debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
