import { useEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import resourcePrefetcher, {
  PrefetchOptions,
  ResourceType,
  PrefetchPriority,
} from '../utils/resourcePrefetcher';

interface UsePrefetchOptions {
  prefetchOnHover?: boolean;
  prefetchOnVisible?: boolean;
  prefetchOnMount?: boolean;
  prefetchLikelyRoutes?: boolean;
  priority?: PrefetchPriority;
}

/**
 * Hook for prefetching resources
 * @param options Prefetch options
 * @returns Object with prefetch methods and state
 */
export function usePrefetch(options: UsePrefetchOptions = {}) {
  const {
    prefetchOnHover = true,
    prefetchOnVisible = true,
    prefetchOnMount = false,
    prefetchLikelyRoutes = false,
    priority = 'auto',
  } = options;

  const location = useLocation();
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [prefetchedUrls, setPrefetchedUrls] = useState<string[]>([]);

  // Prefetch a single resource
  const prefetch = useCallback(
    async (url: string, type: ResourceType = 'document', customOptions?: Partial<PrefetchOptions>) => {
      if (resourcePrefetcher.isPrefetched(url)) {
        return;
      }

      setIsPrefetching(true);

      try {
        await resourcePrefetcher.prefetchResource(url, {
          type,
          priority,
          ...customOptions,
        });

        setPrefetchedUrls((prev) => [...prev, url]);
      } catch (error) {
        console.error(`Failed to prefetch: ${url}`, error);
      } finally {
        setIsPrefetching(false);
      }
    },
    [priority]
  );

  // Prefetch multiple resources
  const prefetchMultiple = useCallback(
    async (resources: Array<{ url: string; type?: ResourceType; options?: Partial<PrefetchOptions> }>) => {
      const notYetPrefetched = resources.filter(
        ({ url }) => !resourcePrefetcher.isPrefetched(url)
      );

      if (notYetPrefetched.length === 0) {
        return;
      }

      setIsPrefetching(true);

      try {
        await Promise.all(
          notYetPrefetched.map(({ url, type = 'document', options }) =>
            resourcePrefetcher.prefetchResource(url, {
              type,
              priority,
              ...options,
            })
          )
        );

        setPrefetchedUrls((prev) => [
          ...prev,
          ...notYetPrefetched.map(({ url }) => url),
        ]);
      } catch (error) {
        console.error('Failed to prefetch multiple resources', error);
      } finally {
        setIsPrefetching(false);
      }
    },
    [priority]
  );

  // Prefetch a route
  const prefetchRoute = useCallback(
    async (route: string) => {
      setIsPrefetching(true);

      try {
        await resourcePrefetcher.prefetchRoute(route);
      } catch (error) {
        console.error(`Failed to prefetch route: ${route}`, error);
      } finally {
        setIsPrefetching(false);
      }
    },
    []
  );

  // Create event handlers for prefetching on hover or visible
  const getPrefetchHandlers = useCallback(
    (url: string, type: ResourceType = 'document', options?: Partial<PrefetchOptions>) => {
      const handlers: Record<string, any> = {};

      if (prefetchOnHover) {
        handlers.onMouseEnter = () => prefetch(url, type, options);
        handlers.onTouchStart = () => prefetch(url, type, options);
      }

      if (prefetchOnVisible) {
        handlers.ref = (el: HTMLElement | null) => {
          if (!el) return;

          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  prefetch(url, type, options);
                  observer.disconnect();
                }
              });
            },
            { threshold: 0.1 }
          );

          observer.observe(el);
        };
      }

      return handlers;
    },
    [prefetch, prefetchOnHover, prefetchOnVisible]
  );

  // Prefetch likely routes based on current location
  useEffect(() => {
    if (prefetchLikelyRoutes) {
      resourcePrefetcher.prefetchLikelyRoutes(location.pathname);
    }
  }, [location.pathname, prefetchLikelyRoutes]);

  // Prefetch on mount if enabled
  useEffect(() => {
    if (prefetchOnMount) {
      resourcePrefetcher.prefetchLikelyRoutes(location.pathname);
    }
  }, [prefetchOnMount, location.pathname]);

  return {
    prefetch,
    prefetchMultiple,
    prefetchRoute,
    getPrefetchHandlers,
    isPrefetching,
    prefetchedUrls,
  };
}

export default usePrefetch;
