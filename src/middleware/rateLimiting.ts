/**
 * Rate limiting middleware for API requests
 */

interface RateLimitOptions {
  /** Maximum number of requests allowed in the time window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Whether to include the user ID in the rate limit key */
  includeUserId?: boolean;
  /** Custom key generator function */
  keyGenerator?: (userId?: string, path?: string) => string;
}

interface RateLimitRecord {
  /** Timestamp of the first request in the current window */
  startTime: number;
  /** Number of requests in the current window */
  count: number;
  /** Timestamp of the last request */
  lastRequest: number;
}

/**
 * Rate limiter class for API requests
 */
export class RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();
  private options: RateLimitOptions;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(options: RateLimitOptions) {
    this.options = {
      limit: 100,
      windowMs: 60 * 1000, // 1 minute
      includeUserId: true,
      ...options,
    };

    // Set up cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, Math.min(this.options.windowMs, 60 * 1000)); // Cleanup at least once per minute
  }

  /**
   * Check if a request is allowed
   * @param userId User ID (optional)
   * @param path Request path (optional)
   * @returns Object with allowed flag and reset time
   */
  checkLimit(userId?: string, path?: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const key = this.generateKey(userId, path);
    const now = Date.now();
    
    // Get or create record
    let record = this.records.get(key);
    
    if (!record) {
      // First request for this key
      record = {
        startTime: now,
        count: 0,
        lastRequest: now,
      };
      this.records.set(key, record);
    } else if (now - record.startTime > this.options.windowMs) {
      // Window has expired, reset the record
      record.startTime = now;
      record.count = 0;
    }
    
    // Check if limit is exceeded
    const allowed = record.count < this.options.limit;
    
    // Update record
    record.count++;
    record.lastRequest = now;
    
    // Calculate reset time
    const resetTime = record.startTime + this.options.windowMs;
    
    return {
      allowed,
      remaining: Math.max(0, this.options.limit - record.count),
      resetTime,
    };
  }

  /**
   * Generate a key for rate limiting
   * @param userId User ID (optional)
   * @param path Request path (optional)
   * @returns Rate limit key
   */
  private generateKey(userId?: string, path?: string): string {
    if (this.options.keyGenerator) {
      return this.options.keyGenerator(userId, path);
    }
    
    const parts: string[] = [];
    
    if (this.options.includeUserId && userId) {
      parts.push(`user:${userId}`);
    }
    
    if (path) {
      parts.push(`path:${path}`);
    }
    
    return parts.length > 0 ? parts.join(':') : 'global';
  }

  /**
   * Clean up expired records
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredTime = now - this.options.windowMs;
    
    for (const [key, record] of this.records.entries()) {
      if (record.lastRequest < expiredTime) {
        this.records.delete(key);
      }
    }
  }

  /**
   * Get current rate limit status
   * @param userId User ID (optional)
   * @param path Request path (optional)
   * @returns Rate limit status
   */
  getStatus(userId?: string, path?: string): {
    limit: number;
    remaining: number;
    resetTime: number;
  } {
    const key = this.generateKey(userId, path);
    const record = this.records.get(key);
    
    if (!record) {
      return {
        limit: this.options.limit,
        remaining: this.options.limit,
        resetTime: Date.now() + this.options.windowMs,
      };
    }
    
    return {
      limit: this.options.limit,
      remaining: Math.max(0, this.options.limit - record.count),
      resetTime: record.startTime + this.options.windowMs,
    };
  }

  /**
   * Reset rate limit for a specific key
   * @param userId User ID (optional)
   * @param path Request path (optional)
   */
  resetLimit(userId?: string, path?: string): void {
    const key = this.generateKey(userId, path);
    this.records.delete(key);
  }

  /**
   * Reset all rate limits
   */
  resetAllLimits(): void {
    this.records.clear();
  }

  /**
   * Stop the cleanup interval
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Create default rate limiters
export const globalRateLimiter = new RateLimiter({
  limit: 100,
  windowMs: 60 * 1000, // 1 minute
  includeUserId: false,
});

export const userRateLimiter = new RateLimiter({
  limit: 100,
  windowMs: 60 * 1000, // 1 minute
  includeUserId: true,
});

export const authRateLimiter = new RateLimiter({
  limit: 10,
  windowMs: 60 * 1000, // 1 minute
  includeUserId: false,
  keyGenerator: (userId, path) => `auth:${userId || 'anonymous'}`,
});

/**
 * Apply rate limiting to a function
 * @param fn Function to rate limit
 * @param rateLimiter Rate limiter instance
 * @param userId User ID (optional)
 * @param path Request path (optional)
 * @returns Rate limited function
 */
export function applyRateLimit<T extends (...args: any[]) => any>(
  fn: T,
  rateLimiter: RateLimiter,
  userId?: string,
  path?: string
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const { allowed, remaining, resetTime } = rateLimiter.checkLimit(userId, path);
    
    if (!allowed) {
      const resetInSeconds = Math.ceil((resetTime - Date.now()) / 1000);
      throw new Error(`Rate limit exceeded. Try again in ${resetInSeconds} seconds.`);
    }
    
    return fn(...args);
  };
}
