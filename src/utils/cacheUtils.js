/**
 * Cache utilities for improved performance
 */

// In-memory cache store
const memoryCache = new Map();

// Default cache options
const DEFAULT_CACHE_OPTIONS = {
  ttl: 5 * 60 * 1000, // 5 minutes in milliseconds
  maxSize: 100, // Maximum number of items in cache
};

/**
 * Memory cache implementation
 */
export const cache = {
  /**
   * Get a value from cache
   * 
   * @param {string} key - Cache key
   * @returns {any} - Cached value or undefined if not found/expired
   */
  get(key) {
    const item = memoryCache.get(key);
    
    if (!item) return undefined;
    
    // Check if item has expired
    if (item.expiry && item.expiry < Date.now()) {
      memoryCache.delete(key);
      return undefined;
    }
    
    return item.value;
  },
  
  /**
   * Set a value in cache
   * 
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {Object} options - Cache options
   */
  set(key, value, options = {}) {
    const opts = { ...DEFAULT_CACHE_OPTIONS, ...options };
    
    // Enforce cache size limit
    if (memoryCache.size >= opts.maxSize && !memoryCache.has(key)) {
      // Remove oldest entry (first item in the map)
      const firstKey = memoryCache.keys().next().value;
      memoryCache.delete(firstKey);
    }
    
    // Calculate expiry time if ttl is provided
    const expiry = opts.ttl ? Date.now() + opts.ttl : null;
    
    memoryCache.set(key, {
      value,
      expiry,
      created: Date.now(),
    });
  },
  
  /**
   * Remove a value from cache
   * 
   * @param {string} key - Cache key
   * @returns {boolean} - True if item was in cache and removed
   */
  delete(key) {
    return memoryCache.delete(key);
  },
  
  /**
   * Clear all cache entries
   */
  clear() {
    memoryCache.clear();
  },
  
  /**
   * Get cache stats
   * 
   * @returns {Object} - Cache statistics
   */
  stats() {
    return {
      size: memoryCache.size,
      keys: Array.from(memoryCache.keys()),
    };
  }
};

/**
 * Memoize a function with caching
 * 
 * @param {Function} fn - Function to memoize
 * @param {Function} keyFn - Function to generate cache key from arguments
 * @param {Object} options - Cache options
 * @returns {Function} - Memoized function
 */
export const memoize = (fn, keyFn = JSON.stringify, options = {}) => {
  return function memoized(...args) {
    const key = `memo:${keyFn(args)}`;
    const cached = cache.get(key);
    
    if (cached !== undefined) {
      return cached;
    }
    
    const result = fn.apply(this, args);
    
    // Handle promises
    if (result instanceof Promise) {
      // Don't cache the promise, cache the resolved value
      return result.then(value => {
        cache.set(key, value, options);
        return value;
      });
    }
    
    cache.set(key, result, options);
    return result;
  };
};

/**
 * Create a cached API call function
 * 
 * @param {Function} apiFn - API call function
 * @param {Object} options - Cache options
 * @returns {Function} - Cached API function
 */
export const createCachedApi = (apiFn, options = {}) => {
  const {
    keyFn = args => args[0], // Default to using first argument (usually URL) as key
    ttl = 5 * 60 * 1000,     // 5 minutes default TTL
    ...cacheOptions
  } = options;
  
  return memoize(apiFn, keyFn, { ttl, ...cacheOptions });
};
