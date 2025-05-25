import React, { memo, useCallback, useMemo, useRef, useEffect } from 'react';
import { markStart, markEnd } from './performanceMonitor';

/**
 * Enhanced memo HOC with performance tracking
 * 
 * @param {React.ComponentType} Component - Component to memoize
 * @param {Function} propsAreEqual - Custom props comparison function
 * @returns {React.MemoExoticComponent} - Memoized component
 */
export const trackedMemo = (Component, propsAreEqual) => {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const TrackedComponent = (props) => {
    const renderCount = useRef(0);
    
    useEffect(() => {
      renderCount.current += 1;
    });
    
    markStart(`render_${displayName}`);
    const result = <Component {...props} />;
    markEnd(`render_${displayName}`);
    
    return result;
  };
  
  TrackedComponent.displayName = `TrackedMemo(${displayName})`;
  
  return memo(TrackedComponent, propsAreEqual);
};

/**
 * Create a tracked version of useCallback
 * 
 * @param {Function} callback - Callback function
 * @param {Array} dependencies - Dependency array
 * @param {string} name - Name for tracking
 * @returns {Function} - Memoized callback
 */
export const trackedCallback = (callback, dependencies, name) => {
  return useCallback((...args) => {
    markStart(`callback_${name}`);
    const result = callback(...args);
    markEnd(`callback_${name}`);
    return result;
  }, dependencies);
};

/**
 * Create a tracked version of useMemo
 * 
 * @param {Function} factory - Factory function
 * @param {Array} dependencies - Dependency array
 * @param {string} name - Name for tracking
 * @returns {any} - Memoized value
 */
export const trackedMemo = (factory, dependencies, name) => {
  return useMemo(() => {
    markStart(`memo_${name}`);
    const result = factory();
    markEnd(`memo_${name}`);
    return result;
  }, dependencies);
};

/**
 * HOC to prevent unnecessary re-renders
 * 
 * @param {React.ComponentType} Component - Component to optimize
 * @param {Array} propKeys - Props to compare
 * @returns {React.MemoExoticComponent} - Optimized component
 */
export const optimizeRenders = (Component, propKeys = []) => {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const arePropsEqual = (prevProps, nextProps) => {
    // If no specific props are provided, compare all props
    const keys = propKeys.length > 0 ? propKeys : Object.keys(prevProps);
    
    return keys.every(key => {
      const prevValue = prevProps[key];
      const nextValue = nextProps[key];
      
      // Handle functions specially - compare by reference only
      if (typeof prevValue === 'function' && typeof nextValue === 'function') {
        return prevValue === nextValue;
      }
      
      // Handle arrays and objects
      if (
        (Array.isArray(prevValue) && Array.isArray(nextValue)) ||
        (isPlainObject(prevValue) && isPlainObject(nextValue))
      ) {
        return JSON.stringify(prevValue) === JSON.stringify(nextValue);
      }
      
      // Simple equality for everything else
      return prevValue === nextValue;
    });
  };
  
  const OptimizedComponent = memo(Component, arePropsEqual);
  OptimizedComponent.displayName = `Optimized(${displayName})`;
  
  return OptimizedComponent;
};

/**
 * Check if value is a plain object
 * 
 * @param {any} obj - Value to check
 * @returns {boolean} - True if plain object
 */
function isPlainObject(obj) {
  return obj !== null && 
         typeof obj === 'object' && 
         Object.getPrototypeOf(obj) === Object.prototype;
}

/**
 * HOC to add performance tracking to a component
 * 
 * @param {React.ComponentType} Component - Component to track
 * @returns {React.ComponentType} - Tracked component
 */
export const withPerformanceTracking = (Component) => {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const TrackedComponent = (props) => {
    const renderCount = useRef(0);
    
    useEffect(() => {
      renderCount.current += 1;
    });
    
    markStart(`render_${displayName}`);
    const result = <Component {...props} />;
    markEnd(`render_${displayName}`);
    
    return result;
  };
  
  TrackedComponent.displayName = `Tracked(${displayName})`;
  
  return TrackedComponent;
};

/**
 * Create a component that only renders when visible in viewport
 * 
 * @param {React.ComponentType} Component - Component to lazy render
 * @param {Object} options - IntersectionObserver options
 * @returns {React.ComponentType} - Lazy rendered component
 */
export const withLazyRender = (Component, options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '200px 0px',
    placeholder = null,
  } = options;
  
  const LazyComponent = (props) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const ref = React.useRef(null);
    
    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold, rootMargin }
      );
      
      if (ref.current) {
        observer.observe(ref.current);
      }
      
      return () => {
        observer.disconnect();
      };
    }, []);
    
    return (
      <div ref={ref}>
        {isVisible ? <Component {...props} /> : placeholder}
      </div>
    );
  };
  
  LazyComponent.displayName = `LazyRendered(${Component.displayName || Component.name || 'Component'})`;
  
  return LazyComponent;
};
