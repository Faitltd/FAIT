import {
  sanitizeString,
  sanitizeObject,
  isValidEmail,
  validatePasswordStrength,
  debounce,
  throttle,
  rateLimit
} from '../securityUtils';

describe('securityUtils', () => {
  describe('sanitizeString', () => {
    it('sanitizes HTML in strings', () => {
      const input = '<script>alert("XSS")</script>Hello';
      const sanitized = sanitizeString(input);
      expect(sanitized).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;Hello');
    });

    it('returns empty string for null or undefined input', () => {
      expect(sanitizeString(null as any)).toBe('');
      expect(sanitizeString(undefined as any)).toBe('');
    });
  });

  describe('sanitizeObject', () => {
    it('sanitizes string properties in an object', () => {
      const input = {
        name: '<script>alert("XSS")</script>John',
        age: 30,
        nested: {
          bio: '<img src="x" onerror="alert(1)">Bio'
        }
      };

      const sanitized = sanitizeObject(input);
      
      expect(sanitized.name).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;John');
      expect(sanitized.age).toBe(30);
      expect(sanitized.nested.bio).toBe('&lt;img src="x" onerror="alert(1)"&gt;Bio');
    });

    it('returns the input if not an object', () => {
      expect(sanitizeObject(null as any)).toBeNull();
    });
  });

  describe('isValidEmail', () => {
    it('validates correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('test.name@example.co.uk')).toBe(true);
      expect(isValidEmail('test+label@example.com')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(isValidEmail('test')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test@example')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('validates strong passwords', () => {
      const result = validatePasswordStrength('StrongP@ss123');
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(3);
    });

    it('rejects weak passwords', () => {
      const result = validatePasswordStrength('password');
      expect(result.isValid).toBe(false);
    });

    it('checks for minimum length', () => {
      const result = validatePasswordStrength('Abc123!');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('at least 8 characters');
    });

    it('checks for uppercase letters', () => {
      const result = validatePasswordStrength('abcdefg123!');
      expect(result.message).toContain('uppercase letter');
    });

    it('checks for lowercase letters', () => {
      const result = validatePasswordStrength('ABCDEFG123!');
      expect(result.message).toContain('lowercase letter');
    });

    it('checks for numbers', () => {
      const result = validatePasswordStrength('AbcdEfgh!');
      expect(result.message).toContain('number');
    });

    it('checks for special characters', () => {
      const result = validatePasswordStrength('Abcd1234');
      expect(result.message).toContain('special character');
    });

    it('detects common password patterns', () => {
      const result = validatePasswordStrength('Password123!');
      expect(result.message).toContain('common pattern');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('debounces function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 500);

      // Call multiple times
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Function should not be called yet
      expect(mockFn).not.toHaveBeenCalled();

      // Fast-forward time
      jest.advanceTimersByTime(600);

      // Function should be called once
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('resets the timer on subsequent calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 500);

      // Call once
      debouncedFn();

      // Advance time but not enough to trigger
      jest.advanceTimersByTime(300);

      // Call again
      debouncedFn();

      // Advance time but not enough to trigger from second call
      jest.advanceTimersByTime(300);

      // Function should not be called yet
      expect(mockFn).not.toHaveBeenCalled();

      // Advance time to trigger from second call
      jest.advanceTimersByTime(200);

      // Function should be called once
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('throttles function calls', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 500);

      // Call multiple times
      throttledFn();
      throttledFn();
      throttledFn();

      // Function should be called once immediately
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Fast-forward time
      jest.advanceTimersByTime(600);

      // Function should be called twice (once immediately, once after throttle period)
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('calls the function again after the throttle period', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 500);

      // Call once
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Call again immediately
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Advance time past throttle period
      jest.advanceTimersByTime(600);
      expect(mockFn).toHaveBeenCalledTimes(2);

      // Call again after throttle period
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('rateLimit', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('limits function calls within a time window', () => {
      const mockFn = jest.fn().mockReturnValue('result');
      const rateLimitedFn = rateLimit(mockFn, 3, 1000);

      // Call within limit
      expect(rateLimitedFn()).toBe('result');
      expect(rateLimitedFn()).toBe('result');
      expect(rateLimitedFn()).toBe('result');

      // Exceed limit
      expect(rateLimitedFn()).toBeNull();
      expect(mockFn).toHaveBeenCalledTimes(3);

      // Advance time past window
      jest.advanceTimersByTime(1100);

      // Should work again
      expect(rateLimitedFn()).toBe('result');
      expect(mockFn).toHaveBeenCalledTimes(4);
    });

    it('resets the limit after the time window', () => {
      const mockFn = jest.fn().mockReturnValue('result');
      const rateLimitedFn = rateLimit(mockFn, 2, 1000);

      // Use up the limit
      expect(rateLimitedFn()).toBe('result');
      expect(rateLimitedFn()).toBe('result');
      expect(rateLimitedFn()).toBeNull();

      // Advance time past window
      jest.advanceTimersByTime(1100);

      // Should have full limit again
      expect(rateLimitedFn()).toBe('result');
      expect(rateLimitedFn()).toBe('result');
      expect(rateLimitedFn()).toBeNull();
    });
  });
});
