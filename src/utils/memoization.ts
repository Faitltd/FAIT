import { memo, useCallback, useMemo, useRef, useState, useEffect } from 'react';
import isEqual from 'lodash/isEqual';
import performanceMonitor from './performanceMonitor';

/**
 * Enhanced version of React.memo with deep comparison
 * @param Component Component to memoize
 * @param propsAreEqual Custom comparison function (defaults to deep comparison)
 * @returns Memoized component
 */
export function memoDeep<T extends React.ComponentType<any>>(
  Component: T,
  propsAreEqual = isEqual
): T {
  return memo(Component, propsAreEqual);
}

/**
 * Create a stable callback that only changes when dependencies change
 * @param callback Callback function
 * @param deps Dependencies array
 * @param name Optional name for performance tracking
 * @returns Memoized callback
 */
export function stableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  name?: string
): T {
  if (name) {
    return useCallback((...args: any[]) => {
      performanceMonitor.markStart(`callback_${name}`);
      const result = callback(...args);
      performanceMonitor.markEnd(`callback_${name}`);
      return result;
    }, deps) as T;
  }
  
  return useCallback(callback, deps) as T;
}

/**
 * Create a stable value that only changes when dependencies change
 * @param factory Factory function
 * @param deps Dependencies array
 * @param name Optional name for performance tracking
 * @returns Memoized value
 */
export function stableValue<T>(
  factory: () => T,
  deps: React.DependencyList,
  name?: string
): T {
  if (name) {
    return useMemo(() => {
      performanceMonitor.markStart(`memo_${name}`);
      const result = factory();
      performanceMonitor.markEnd(`memo_${name}`);
      return result;
    }, deps);
  }
  
  return useMemo(factory, deps);
}

/**
 * Create a stable reference that persists across renders
 * @param initialValue Initial value
 * @returns Stable reference
 */
export function stableRef<T>(initialValue: T): React.MutableRefObject<T> {
  return useRef<T>(initialValue);
}

/**
 * Create a stable state that only triggers re-renders when the value changes
 * @param initialValue Initial value
 * @param isEqual Comparison function (defaults to deep comparison)
 * @returns [value, setValue] tuple
 */
export function stableState<T>(
  initialValue: T,
  isEqualFn = isEqual
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initialValue);
  const stateRef = useRef<T>(initialValue);
  
  const setStableState = useCallback((value: T | ((prev: T) => T)) => {
    const newValue = typeof value === 'function'
      ? (value as (prev: T) => T)(stateRef.current)
      : value;
    
    if (!isEqualFn(stateRef.current, newValue)) {
      stateRef.current = newValue;
      setState(newValue);
    }
  }, [isEqualFn]);
  
  return [state, setStableState];
}

/**
 * Hook to memoize expensive calculations
 * @param calculate Function to calculate the value
 * @param dependencies Dependencies array
 * @param options Additional options
 * @returns Memoized value
 */
export function useMemoized<T>(
  calculate: () => T,
  dependencies: React.DependencyList,
  options: {
    name?: string;
    maxAge?: number;
    cacheSize?: number;
  } = {}
): T {
  const { name, maxAge, cacheSize } = options;
  
  // Use a ref to store the cache
  const cacheRef = useRef<{
    value: T;
    timestamp: number;
    dependencies: React.DependencyList;
  } | null>(null);
  
  // Check if dependencies have changed
  const depsChanged = !cacheRef.current || !isEqual(cacheRef.current.dependencies, dependencies);
  
  // Check if cache has expired
  const cacheExpired = maxAge && cacheRef.current
    ? Date.now() - cacheRef.current.timestamp > maxAge
    : false;
  
  // Recalculate if needed
  if (depsChanged || cacheExpired) {
    if (name) {
      performanceMonitor.markStart(`memoized_${name}`);
    }
    
    const value = calculate();
    
    if (name) {
      performanceMonitor.markEnd(`memoized_${name}`);
    }
    
    cacheRef.current = {
      value,
      timestamp: Date.now(),
      dependencies,
    };
  }
  
  // Return the cached value
  return cacheRef.current!.value;
}

/**
 * Hook to debounce a value
 * @param value Value to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced value
 */
export function useDebounced<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Hook to throttle a value
 * @param value Value to throttle
 * @param limit Limit in milliseconds
 * @returns Throttled value
 */
export function useThrottled<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());
  
  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastUpdated.current;
    
    if (elapsed >= limit) {
      setThrottledValue(value);
      lastUpdated.current = now;
    } else {
      const timer = setTimeout(() => {
        setThrottledValue(value);
        lastUpdated.current = Date.now();
      }, limit - elapsed);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [value, limit]);
  
  return throttledValue;
}

export default {
  memoDeep,
  stableCallback,
  stableValue,
  stableRef,
  stableState,
  useMemoized,
  useDebounced,
  useThrottled,
};
