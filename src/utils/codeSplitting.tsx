import React, { lazy, Suspense, ComponentType } from 'react';
import performanceMonitor from './performanceMonitor';

// Default loading component
const DefaultLoading = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

// Default error component
const DefaultError = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
    <h3 className="text-lg font-medium text-red-800">Error loading component</h3>
    <p className="mt-2 text-sm text-red-700">{error.message}</p>
    <button
      onClick={retry}
      className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
    >
      Retry
    </button>
  </div>
);

interface LazyLoadOptions {
  fallback?: React.ReactNode;
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
  suspenseFallback?: React.ReactNode;
  preload?: boolean;
  name?: string;
}

/**
 * Enhanced lazy loading with error handling, retries, and performance tracking
 * @param factory Factory function that imports the component
 * @param options Options for lazy loading
 * @returns Lazy loaded component
 */
export function lazyLoad<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): React.ComponentType<React.ComponentProps<T>> {
  const {
    fallback = <DefaultLoading />,
    errorComponent: ErrorComponent = DefaultError,
    onLoad,
    onError,
    timeout,
    suspenseFallback,
    preload = false,
    name = 'unknown',
  } = options;

  // Track component loading time
  const loadWithTracking = () => {
    performanceMonitor.markStart(`lazy_load_${name}`);
    
    return factory()
      .then((module) => {
        performanceMonitor.markEnd(`lazy_load_${name}`);
        if (onLoad) onLoad();
        return module;
      })
      .catch((error) => {
        performanceMonitor.markEnd(`lazy_load_${name}`);
        if (onError) onError(error);
        throw error;
      });
  };

  // Create lazy component
  const LazyComponent = lazy(loadWithTracking);

  // Preload the component if requested
  if (preload) {
    loadWithTracking().catch(() => {
      // Ignore preload errors
    });
  }

  // Create a wrapper component with error handling
  const ComponentWithErrorHandling = (props: React.ComponentProps<T>) => {
    const [error, setError] = React.useState<Error | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [key, setKey] = React.useState(0);

    // Handle retry
    const handleRetry = () => {
      setError(null);
      setIsLoading(true);
      setKey((prev) => prev + 1);
    };

    // Handle timeout
    React.useEffect(() => {
      let timeoutId: NodeJS.Timeout | null = null;

      if (timeout && isLoading) {
        timeoutId = setTimeout(() => {
          setError(new Error(`Loading timed out after ${timeout}ms`));
          setIsLoading(false);
        }, timeout);
      }

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }, [isLoading, timeout]);

    // If there's an error, show the error component
    if (error) {
      return <ErrorComponent error={error} retry={handleRetry} />;
    }

    // Otherwise, render the lazy component
    return (
      <Suspense
        fallback={suspenseFallback || fallback}
        key={key}
      >
        <LazyComponent {...props} />
      </Suspense>
    );
  };

  return ComponentWithErrorHandling;
}

/**
 * Preload a component without rendering it
 * @param factory Factory function that imports the component
 * @param options Options for preloading
 * @returns Promise that resolves when the component is loaded
 */
export function preloadComponent<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options: { name?: string; onLoad?: () => void; onError?: (error: Error) => void } = {}
): Promise<void> {
  const { name = 'unknown', onLoad, onError } = options;

  performanceMonitor.markStart(`preload_${name}`);

  return factory()
    .then(() => {
      performanceMonitor.markEnd(`preload_${name}`);
      if (onLoad) onLoad();
    })
    .catch((error) => {
      performanceMonitor.markEnd(`preload_${name}`);
      if (onError) onError(error);
      throw error;
    });
}

/**
 * Create a component that loads on visibility
 * @param factory Factory function that imports the component
 * @param options Options for lazy loading
 * @returns Component that loads when visible
 */
export function lazyLoadOnVisible<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options: LazyLoadOptions & { threshold?: number } = {}
): React.ComponentType<React.ComponentProps<T>> {
  const { threshold = 0.1, ...lazyOptions } = options;
  const LazyComponent = lazyLoad(factory, lazyOptions);

  return (props: React.ComponentProps<T>) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (!ref.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer.disconnect();
            }
          });
        },
        { threshold }
      );

      observer.observe(ref.current);

      return () => {
        observer.disconnect();
      };
    }, [threshold]);

    return (
      <div ref={ref}>
        {isVisible ? (
          <LazyComponent {...props} />
        ) : (
          <div style={{ height: 200 }} className="bg-gray-100 animate-pulse rounded-md" />
        )}
      </div>
    );
  };
}

/**
 * Create a component that loads on interaction
 * @param factory Factory function that imports the component
 * @param options Options for lazy loading
 * @returns Component that loads on interaction
 */
export function lazyLoadOnInteraction<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options: LazyLoadOptions & { events?: string[] } = {}
): React.ComponentType<React.ComponentProps<T>> {
  const { events = ['mouseenter', 'touchstart', 'focus'], ...lazyOptions } = options;
  const LazyComponent = lazyLoad(factory, lazyOptions);

  return (props: React.ComponentProps<T>) => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (!ref.current || isLoaded) return;

      const element = ref.current;
      const loadComponent = () => {
        setIsLoaded(true);
        // Remove event listeners after loading
        events.forEach((event) => {
          element.removeEventListener(event, loadComponent);
        });
      };

      // Add event listeners
      events.forEach((event) => {
        element.addEventListener(event, loadComponent);
      });

      return () => {
        // Clean up event listeners
        events.forEach((event) => {
          element.removeEventListener(event, loadComponent);
        });
      };
    }, [isLoaded, events]);

    return (
      <div ref={ref}>
        {isLoaded ? (
          <LazyComponent {...props} />
        ) : (
          options.fallback || (
            <div style={{ height: 200 }} className="bg-gray-100 animate-pulse rounded-md" />
          )
        )}
      </div>
    );
  };
}

export default {
  lazyLoad,
  preloadComponent,
  lazyLoadOnVisible,
  lazyLoadOnInteraction,
};
