import { RateLimiter, applyRateLimit } from '../rateLimiting';

describe('rateLimiting', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('RateLimiter', () => {
    it('allows requests within the limit', () => {
      const limiter = new RateLimiter({ limit: 3, windowMs: 1000 });
      
      expect(limiter.checkLimit().allowed).toBe(true);
      expect(limiter.checkLimit().allowed).toBe(true);
      expect(limiter.checkLimit().allowed).toBe(true);
    });

    it('blocks requests over the limit', () => {
      const limiter = new RateLimiter({ limit: 2, windowMs: 1000 });
      
      expect(limiter.checkLimit().allowed).toBe(true);
      expect(limiter.checkLimit().allowed).toBe(true);
      expect(limiter.checkLimit().allowed).toBe(false);
    });

    it('resets the limit after the window expires', () => {
      const limiter = new RateLimiter({ limit: 2, windowMs: 1000 });
      
      expect(limiter.checkLimit().allowed).toBe(true);
      expect(limiter.checkLimit().allowed).toBe(true);
      expect(limiter.checkLimit().allowed).toBe(false);
      
      // Advance time past the window
      jest.advanceTimersByTime(1100);
      
      // Limit should be reset
      expect(limiter.checkLimit().allowed).toBe(true);
    });

    it('tracks limits separately by user ID', () => {
      const limiter = new RateLimiter({ limit: 2, windowMs: 1000, includeUserId: true });
      
      // User 1
      expect(limiter.checkLimit('user1').allowed).toBe(true);
      expect(limiter.checkLimit('user1').allowed).toBe(true);
      expect(limiter.checkLimit('user1').allowed).toBe(false);
      
      // User 2 should have their own limit
      expect(limiter.checkLimit('user2').allowed).toBe(true);
      expect(limiter.checkLimit('user2').allowed).toBe(true);
      expect(limiter.checkLimit('user2').allowed).toBe(false);
    });

    it('tracks limits separately by path', () => {
      const limiter = new RateLimiter({ limit: 2, windowMs: 1000, includeUserId: false });
      
      // Path 1
      expect(limiter.checkLimit(undefined, '/api/users').allowed).toBe(true);
      expect(limiter.checkLimit(undefined, '/api/users').allowed).toBe(true);
      expect(limiter.checkLimit(undefined, '/api/users').allowed).toBe(false);
      
      // Path 2 should have its own limit
      expect(limiter.checkLimit(undefined, '/api/posts').allowed).toBe(true);
    });

    it('supports custom key generators', () => {
      const limiter = new RateLimiter({
        limit: 2,
        windowMs: 1000,
        keyGenerator: (userId, path) => `custom:${userId}:${path}`,
      });
      
      expect(limiter.checkLimit('user1', '/api/users').allowed).toBe(true);
      expect(limiter.checkLimit('user1', '/api/users').allowed).toBe(true);
      expect(limiter.checkLimit('user1', '/api/users').allowed).toBe(false);
      
      // Different path should have its own limit
      expect(limiter.checkLimit('user1', '/api/posts').allowed).toBe(true);
    });

    it('cleans up expired records', () => {
      const limiter = new RateLimiter({ limit: 2, windowMs: 1000 });
      
      // Make some requests
      limiter.checkLimit('user1');
      limiter.checkLimit('user2');
      
      // Advance time past the window
      jest.advanceTimersByTime(1100);
      
      // Trigger cleanup
      jest.advanceTimersByTime(60000);
      
      // Records should be cleaned up
      expect(limiter.getStatus('user1').remaining).toBe(2);
      expect(limiter.getStatus('user2').remaining).toBe(2);
    });

    it('provides remaining count', () => {
      const limiter = new RateLimiter({ limit: 3, windowMs: 1000 });
      
      expect(limiter.checkLimit().remaining).toBe(2);
      expect(limiter.checkLimit().remaining).toBe(1);
      expect(limiter.checkLimit().remaining).toBe(0);
    });

    it('provides reset time', () => {
      const now = Date.now();
      const limiter = new RateLimiter({ limit: 2, windowMs: 1000 });
      
      const result = limiter.checkLimit();
      expect(result.resetTime).toBeGreaterThan(now);
      expect(result.resetTime).toBeLessThanOrEqual(now + 1000);
    });

    it('can reset limits for specific keys', () => {
      const limiter = new RateLimiter({ limit: 2, windowMs: 1000 });
      
      // Use up the limit
      limiter.checkLimit('user1');
      limiter.checkLimit('user1');
      expect(limiter.checkLimit('user1').allowed).toBe(false);
      
      // Reset the limit
      limiter.resetLimit('user1');
      
      // Should be allowed again
      expect(limiter.checkLimit('user1').allowed).toBe(true);
    });

    it('can reset all limits', () => {
      const limiter = new RateLimiter({ limit: 2, windowMs: 1000 });
      
      // Use up limits for multiple users
      limiter.checkLimit('user1');
      limiter.checkLimit('user1');
      limiter.checkLimit('user2');
      limiter.checkLimit('user2');
      
      // Reset all limits
      limiter.resetAllLimits();
      
      // Should be allowed again
      expect(limiter.checkLimit('user1').allowed).toBe(true);
      expect(limiter.checkLimit('user2').allowed).toBe(true);
    });
  });

  describe('applyRateLimit', () => {
    it('applies rate limiting to a function', async () => {
      const limiter = new RateLimiter({ limit: 2, windowMs: 1000 });
      const mockFn = jest.fn().mockReturnValue('result');
      const limitedFn = applyRateLimit(mockFn, limiter, 'user1', '/api/test');
      
      // First two calls should succeed
      await expect(limitedFn()).resolves.toBe('result');
      await expect(limitedFn()).resolves.toBe('result');
      
      // Third call should be rate limited
      await expect(limitedFn()).rejects.toThrow('Rate limit exceeded');
      
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('resets rate limit after window expires', async () => {
      const limiter = new RateLimiter({ limit: 1, windowMs: 1000 });
      const mockFn = jest.fn().mockReturnValue('result');
      const limitedFn = applyRateLimit(mockFn, limiter);
      
      // First call should succeed
      await expect(limitedFn()).resolves.toBe('result');
      
      // Second call should be rate limited
      await expect(limitedFn()).rejects.toThrow('Rate limit exceeded');
      
      // Advance time past the window
      jest.advanceTimersByTime(1100);
      
      // Should be allowed again
      await expect(limitedFn()).resolves.toBe('result');
      
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });
});
