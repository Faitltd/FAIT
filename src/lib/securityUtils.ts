/**
 * Security utilities for the application
 */

/**
 * Sanitize a string to prevent XSS attacks
 * @param input String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Sanitize an object's string properties to prevent XSS attacks
 * @param obj Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (!obj) return obj;

  const result = { ...obj };
  
  for (const key in result) {
    if (typeof result[key] === 'string') {
      result[key] = sanitizeString(result[key]);
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = sanitizeObject(result[key]);
    }
  }
  
  return result;
}

/**
 * Generate a secure random token
 * @param length Length of the token
 * @returns Random token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a string using SHA-256
 * @param input String to hash
 * @returns Promise that resolves to the hashed string
 */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate an email address
 * @param email Email address to validate
 * @returns Boolean indicating if the email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate a password strength
 * @param password Password to validate
 * @returns Object with validation result and message
 */
export function validatePasswordStrength(password: string): { 
  isValid: boolean; 
  message: string;
  score: number; // 0-4, higher is stronger
} {
  if (!password) {
    return { 
      isValid: false, 
      message: 'Password is required',
      score: 0
    };
  }

  let score = 0;
  const messages: string[] = [];

  // Length check
  if (password.length < 8) {
    messages.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  // Complexity checks
  if (!/[A-Z]/.test(password)) {
    messages.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    messages.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    messages.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    messages.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  // Common password patterns
  const commonPatterns = [
    'password', '123456', 'qwerty', 'admin', 'welcome',
    'letmein', 'monkey', 'abc123', 'football', 'iloveyou'
  ];

  if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    messages.push('Password contains a common pattern');
    score = Math.max(0, score - 2);
  }

  // Final validation
  const isValid = score >= 3 && password.length >= 8;
  
  return {
    isValid,
    message: messages.length > 0 ? messages.join('. ') : 'Password is strong',
    score: Math.min(4, score)
  };
}

/**
 * Rate limiter for function calls
 * @param fn Function to rate limit
 * @param limit Maximum number of calls in the time window
 * @param window Time window in milliseconds
 * @returns Rate limited function
 */
export function rateLimit<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 5,
  window: number = 1000
): (...args: Parameters<T>) => ReturnType<T> | null {
  const calls: number[] = [];
  
  return (...args: Parameters<T>): ReturnType<T> | null => {
    const now = Date.now();
    
    // Remove expired timestamps
    while (calls.length > 0 && calls[0] < now - window) {
      calls.shift();
    }
    
    // Check if we've hit the limit
    if (calls.length >= limit) {
      console.warn('Rate limit exceeded');
      return null;
    }
    
    // Add current timestamp and call the function
    calls.push(now);
    return fn(...args);
  };
}

/**
 * Debounce a function
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle a function
 * @param fn Function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>): void => {
    const now = Date.now();
    
    if (now - lastCall >= limit) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      lastCall = now;
      fn(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
      }, limit - (now - lastCall));
    }
  };
}
