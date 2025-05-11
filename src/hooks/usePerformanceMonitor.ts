import { useEffect, useRef } from 'react';
import performanceMonitor from '../utils/performanceMonitor';

interface UsePerformanceMonitorOptions {
  componentName: string;
  trackRender?: boolean;
  trackMount?: boolean;
  trackUpdate?: boolean;
  trackUnmount?: boolean;
  trackInteractions?: boolean;
}

/**
 * Hook for monitoring component performance
 * @param options Configuration options
 * @returns Object with performance tracking methods
 */
export function usePerformanceMonitor({
  componentName,
  trackRender = true,
  trackMount = true,
  trackUpdate = false,
  trackUnmount = false,
  trackInteractions = false,
}: UsePerformanceMonitorOptions) {
  const renderStartTime = useRef<number>(0);
  const mountStartTime = useRef<number>(0);
  const updateStartTime = useRef<number>(0);
  const interactionStartTimes = useRef<Record<string, number>>({});
  const isMounted = useRef<boolean>(false);

  // Track component render time
  useEffect(() => {
    if (trackRender) {
      const renderTime = performance.now() - renderStartTime.current;
      performanceMonitor.trackComponentRender(componentName, renderTime);
    }
  });

  // Track component mount time
  useEffect(() => {
    if (trackMount && !isMounted.current) {
      const mountTime = performance.now() - mountStartTime.current;
      performanceMonitor.markEnd(`${componentName}_mount`);
      isMounted.current = true;
    }

    // Track component unmount time
    return () => {
      if (trackUnmount) {
        performanceMonitor.markStart(`${componentName}_unmount`);
        setTimeout(() => {
          performanceMonitor.markEnd(`${componentName}_unmount`);
        }, 0);
      }
    };
  }, [componentName, trackMount, trackUnmount]);

  // Track component update time
  useEffect(() => {
    if (!isMounted.current) return;

    if (trackUpdate) {
      const updateTime = performance.now() - updateStartTime.current;
      performanceMonitor.markEnd(`${componentName}_update`);
    }
  });

  // Initialize timing references
  if (renderStartTime.current === 0) {
    renderStartTime.current = performance.now();
  }

  if (mountStartTime.current === 0) {
    mountStartTime.current = performance.now();
    performanceMonitor.markStart(`${componentName}_mount`);
  }

  if (updateStartTime.current === 0 && isMounted.current) {
    updateStartTime.current = performance.now();
    performanceMonitor.markStart(`${componentName}_update`);
  }

  /**
   * Track a custom interaction within the component
   * @param interactionName Name of the interaction
   */
  const trackInteractionStart = (interactionName: string) => {
    if (!trackInteractions) return;

    const fullName = `${componentName}_${interactionName}`;
    interactionStartTimes.current[interactionName] = performance.now();
    performanceMonitor.markStart(fullName);
  };

  /**
   * End tracking a custom interaction and record the duration
   * @param interactionName Name of the interaction
   * @returns Duration of the interaction in milliseconds
   */
  const trackInteractionEnd = (interactionName: string): number => {
    if (!trackInteractions) return 0;
    if (!interactionStartTimes.current[interactionName]) return 0;

    const fullName = `${componentName}_${interactionName}`;
    const duration = performanceMonitor.markEnd(fullName);
    delete interactionStartTimes.current[interactionName];
    return duration;
  };

  /**
   * Track an API call
   * @param apiName Name of the API call
   * @param duration Duration of the API call in milliseconds
   */
  const trackApiCall = (apiName: string, duration: number) => {
    performanceMonitor.trackApiCall(`${componentName}_${apiName}`, duration);
  };

  /**
   * Create a wrapped version of a function that tracks its execution time
   * @param fn Function to wrap
   * @param interactionName Name of the interaction
   * @returns Wrapped function
   */
  const withTracking = <T extends (...args: any[]) => any>(
    fn: T,
    interactionName: string
  ): ((...args: Parameters<T>) => ReturnType<T>) => {
    return (...args: Parameters<T>): ReturnType<T> => {
      trackInteractionStart(interactionName);
      const result = fn(...args);
      
      // Handle promises
      if (result instanceof Promise) {
        return result
          .then((value) => {
            trackInteractionEnd(interactionName);
            return value;
          })
          .catch((error) => {
            trackInteractionEnd(interactionName);
            throw error;
          }) as ReturnType<T>;
      }
      
      trackInteractionEnd(interactionName);
      return result;
    };
  };

  return {
    trackInteractionStart,
    trackInteractionEnd,
    trackApiCall,
    withTracking,
  };
}

export default usePerformanceMonitor;
