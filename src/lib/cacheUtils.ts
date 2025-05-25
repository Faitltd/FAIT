/**
 * Advanced caching utility for the FAIT Co-Op Platform
 * Provides in-memory and persistent caching mechanisms
 */

interface CacheItem<T> {
  /** Cached data */
  data: T;
  /** Timestamp when the item was cached */
  timestamp: number;
  /** Expiration timestamp */
  expiresAt: number;
  /** Cache version for invalidation */
  version?: string;
}

interface CacheOptions {
  /** Cache expiration time in milliseconds */
  expiresIn?: number;
  /** Cache key prefix */
  prefix?: string;
  /** Whether to persist in localStorage */
  persist?: boolean;
  /** Cache version for invalidation */
  version?: string;
}

class ApiCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultExpiresIn: number = 5 * 60 * 1000; // 5 minutes
  private prefix: string = 'api-cache:';
  private cacheVersion: string = '1.0.0';
  private persistEnabled: boolean = typeof window !== 'undefined';

  constructor() {
    // Load persisted cache items on initialization
    this.loadPersistedItems();
  }

  /**
   * Set global cache options
   */
  setOptions(options: CacheOptions): void {
    if (options.expiresIn) {
      this.defaultExpiresIn = options.expiresIn;
    }
    if (options.prefix) {
      this.prefix = options.prefix;
    }
    if (options.version) {
      this.cacheVersion = options.version;
    }
  }

  /**
   * Load persisted cache items from localStorage
   */
  private loadPersistedItems(): void {
    if (!this.persistEnabled) return;

    try {
      const now = Date.now();
      const keys = Object.keys(localStorage);

      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              const item = JSON.parse(value) as CacheItem<any>;

              // Skip expired or version mismatched items
              if (item.expiresAt < now || (item.version && item.version !== this.cacheVersion)) {
                localStorage.removeItem(key);
                continue;
              }

              // Add to memory cache
              const cacheKey = key.substring(this.prefix.length);
              this.cache.set(cacheKey, item);
            } catch (e) {
              // Invalid JSON, remove the item
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted cache items:', error);
    }
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | null {
    const cacheKey = this.getCacheKey(key);
    const item = this.cache.get(cacheKey);

    if (!item) {
      // Try to get from localStorage if not in memory
      if (this.persistEnabled) {
        try {
          const persistedItem = localStorage.getItem(this.prefix + key);
          if (persistedItem) {
            const parsedItem = JSON.parse(persistedItem) as CacheItem<T>;

            // Check if expired or version mismatch
            if (Date.now() > parsedItem.expiresAt ||
                (parsedItem.version && parsedItem.version !== this.cacheVersion)) {
              localStorage.removeItem(this.prefix + key);
              return null;
            }

            // Add to memory cache
            this.cache.set(cacheKey, parsedItem);
            return parsedItem.data;
          }
        } catch (error) {
          console.warn(`Failed to retrieve persisted cache item for key ${key}:`, error);
        }
      }
      return null;
    }

    // Check if the item has expired or version mismatch
    if (Date.now() > item.expiresAt ||
        (item.version && item.version !== this.cacheVersion)) {
      this.remove(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, data: T, options?: CacheOptions): void {
    const cacheKey = this.getCacheKey(key);
    const expiresIn = options?.expiresIn || this.defaultExpiresIn;
    const persist = options?.persist ?? false;
    const version = options?.version || this.cacheVersion;
    const now = Date.now();

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: now + expiresIn,
      version
    };

    // Store in memory cache
    this.cache.set(cacheKey, cacheItem);

    // Store in localStorage if persist is true
    if (persist && this.persistEnabled) {
      try {
        localStorage.setItem(this.prefix + key, JSON.stringify(cacheItem));
      } catch (error) {
        console.warn(`Failed to persist cache item for key ${key}:`, error);

        // If localStorage is full, clear old items and try again
        if (error instanceof DOMException &&
            (error.name === 'QuotaExceededError' ||
             error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          this.clearOldPersistedItems();
          try {
            localStorage.setItem(this.prefix + key, JSON.stringify(cacheItem));
          } catch (retryError) {
            console.error(`Failed to persist cache item after clearing old items:`, retryError);
          }
        }
      }
    }
  }

  /**
   * Remove a value from the cache
   */
  remove(key: string): void {
    const cacheKey = this.getCacheKey(key);
    this.cache.delete(cacheKey);

    // Remove from localStorage if it exists
    if (this.persistEnabled) {
      try {
        localStorage.removeItem(this.prefix + key);
      } catch (error) {
        console.warn(`Failed to remove persisted cache item for key ${key}:`, error);
      }
    }
  }

  /**
   * Clear old persisted items when localStorage is full
   */
  private clearOldPersistedItems(): void {
    if (!this.persistEnabled) return;

    try {
      const now = Date.now();
      const keys = Object.keys(localStorage);
      const prefixKeys = keys.filter(k => k.startsWith(this.prefix));

      // Sort by oldest first (we'll remove these)
      const itemsToCheck = prefixKeys.map(key => {
        try {
          const value = localStorage.getItem(key);
          if (!value) return { key, timestamp: now };

          const item = JSON.parse(value) as CacheItem<any>;
          return { key, timestamp: item.timestamp };
        } catch (e) {
          return { key, timestamp: now };
        }
      }).sort((a, b) => a.timestamp - b.timestamp);

      // Remove the oldest 20% of items
      const removeCount = Math.max(1, Math.ceil(itemsToCheck.length * 0.2));
      for (let i = 0; i < removeCount; i++) {
        if (i < itemsToCheck.length) {
          localStorage.removeItem(itemsToCheck[i].key);
        }
      }
    } catch (error) {
      console.warn('Failed to clear old persisted items:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  clear(options: { memoryOnly?: boolean } = {}): void {
    const { memoryOnly = false } = options;

    // Clear memory cache
    this.cache.clear();

    // Clear localStorage cache if not memoryOnly
    if (!memoryOnly && this.persistEnabled) {
      try {
        const keys = Object.keys(localStorage);

        for (const key of keys) {
          if (key.startsWith(this.prefix)) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        console.warn('Failed to clear persisted cache:', error);
      }
    }
  }

  /**
   * Check if a key exists in the cache
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Get or fetch data
   * @param key Cache key
   * @param fetcher Function to fetch data if not in cache
   * @param options Cache options
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    // Check cache first
    const cachedData = this.get<T>(key);

    if (cachedData !== null) {
      return cachedData;
    }

    // Fetch data
    const data = await fetcher();

    // Cache the result
    this.set(key, data, options);

    return data;
  }

  /**
   * Clear expired cache entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache stats
   */
  getStats(): { memorySize: number; persistentSize: number; keys: string[]; persistentKeys: string[] } {
    let persistentSize = 0;
    let persistentKeys: string[] = [];

    if (this.persistEnabled) {
      try {
        const keys = Object.keys(localStorage);
        persistentKeys = keys.filter(k => k.startsWith(this.prefix));

        // Calculate total size of persisted items
        for (const key of persistentKeys) {
          const value = localStorage.getItem(key) || '';
          persistentSize += value.length * 2; // Approximate size in bytes (UTF-16)
        }
      } catch (error) {
        console.warn('Failed to calculate persistent cache stats:', error);
      }
    }

    return {
      memorySize: this.cache.size,
      persistentSize,
      keys: Array.from(this.cache.keys()),
      persistentKeys: persistentKeys.map(k => k.substring(this.prefix.length))
    };
  }

  /**
   * Update cache version to invalidate all existing cache
   */
  updateVersion(newVersion: string): void {
    this.cacheVersion = newVersion;
    this.clear();
  }

  /**
   * Prefetch and cache data
   */
  async prefetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<void> {
    try {
      const data = await fetcher();
      this.set(key, data, options);
    } catch (error) {
      console.warn(`Failed to prefetch cache item ${key}:`, error);
    }
  }

  /**
   * Get the full cache key with prefix
   */
  private getCacheKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Wrap an async function with caching
   * @param fn The async function to wrap
   * @param keyFn Function to generate cache key from args
   * @param options Cache options
   */
  withCache<T, Args extends any[]>(
    fn: (...args: Args) => Promise<T>,
    keyFn: (...args: Args) => string,
    options?: CacheOptions
  ): (...args: Args) => Promise<T> {
    return async (...args: Args): Promise<T> => {
      const cacheKey = keyFn(...args);
      const cachedData = this.get<T>(cacheKey);

      if (cachedData !== null) {
        return cachedData;
      }

      const data = await fn(...args);
      this.set(cacheKey, data, options);
      return data;
    };
  }

  /**
   * Invalidate cache items by prefix
   */
  invalidateByPrefix(prefix: string): void {
    // Clear memory cache items with prefix
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }

    // Clear localStorage items with prefix
    if (this.persistEnabled) {
      try {
        const keys = Object.keys(localStorage);

        for (const key of keys) {
          if (key.startsWith(this.prefix + prefix)) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        console.warn(`Failed to invalidate persisted cache items with prefix ${prefix}:`, error);
      }
    }
  }
}

// Create a singleton instance
export const apiCache = new ApiCache();

/**
 * Decorator for caching async methods
 * @param keyFn Function to generate cache key from method args
 * @param options Cache options
 */
export function Cached(
  keyFn: (...args: any[]) => string,
  options?: CacheOptions
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = keyFn.apply(this, args);
      const cachedData = apiCache.get(cacheKey);

      if (cachedData !== null) {
        return cachedData;
      }

      const result = await originalMethod.apply(this, args);
      apiCache.set(cacheKey, result, options);
      return result;
    };

    return descriptor;
  };
}

/**
 * Decorator for caching async methods with persistence
 * @param keyFn Function to generate cache key from method args
 * @param options Cache options
 */
export function PersistedCache(
  keyFn: (...args: any[]) => string,
  options?: CacheOptions
) {
  return Cached(keyFn, { ...options, persist: true });
}

/**
 * Clear cache entries that match a key pattern
 * @param pattern String pattern to match against cache keys
 */
export function clearCacheByPattern(pattern: string): void {
  const stats = apiCache.getStats();
  const regex = new RegExp(pattern);

  // Clear memory cache
  for (const key of stats.keys) {
    if (regex.test(key)) {
      apiCache.remove(key);
    }
  }

  // Clear persistent cache
  for (const key of stats.persistentKeys) {
    if (regex.test(key)) {
      apiCache.remove(key);
    }
  }
}

/**
 * Create a cache key from a base and parameters
 */
export function createCacheKey(base: string, params?: Record<string, any>): string {
  if (!params) {
    return base;
  }

  // Sort keys for consistent cache keys
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {} as Record<string, any>);

  return `${base}:${JSON.stringify(sortedParams)}`;
}

// Set up a periodic cleanup of expired cache entries
setInterval(() => {
  apiCache.clearExpired();
}, 60 * 1000); // Run every minute
