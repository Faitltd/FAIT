/**
 * Utility for prefetching resources to improve performance
 */

// Types of resources that can be prefetched
export type ResourceType = 'image' | 'script' | 'style' | 'font' | 'document' | 'fetch';

// Priority levels for prefetching
export type PrefetchPriority = 'high' | 'medium' | 'low' | 'auto';

// Resource prefetching options
export interface PrefetchOptions {
  type: ResourceType;
  priority?: PrefetchPriority;
  as?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  media?: string;
  importance?: 'auto' | 'high' | 'low';
  fetchOptions?: RequestInit;
}

// Cache for tracking prefetched resources
const prefetchedResources = new Set<string>();

// Queue for managing prefetch requests
const prefetchQueue: Array<{ url: string; options: PrefetchOptions }> = [];

// Flag to track if the queue is currently being processed
let isProcessingQueue = false;

// Maximum number of concurrent prefetch requests
const MAX_CONCURRENT_REQUESTS = 6;

// Current number of active prefetch requests
let activeRequests = 0;

/**
 * Check if a resource has already been prefetched
 * @param url URL of the resource
 * @returns True if the resource has been prefetched
 */
export const isPrefetched = (url: string): boolean => {
  return prefetchedResources.has(url);
};

/**
 * Prefetch a resource using the appropriate method based on the resource type
 * @param url URL of the resource to prefetch
 * @param options Prefetch options
 * @returns Promise that resolves when the resource is prefetched
 */
export const prefetchResource = (
  url: string,
  options: PrefetchOptions
): Promise<void> => {
  // If already prefetched, return immediately
  if (isPrefetched(url)) {
    return Promise.resolve();
  }

  // Add to queue and process
  prefetchQueue.push({ url, options });
  prefetchedResources.add(url);
  
  // Start processing the queue if not already processing
  if (!isProcessingQueue) {
    processQueue();
  }
  
  // Return a promise that resolves when the resource is prefetched
  return new Promise((resolve) => {
    // Check periodically if the resource has been prefetched
    const checkInterval = setInterval(() => {
      if (!prefetchQueue.some(item => item.url === url)) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
  });
};

/**
 * Process the prefetch queue
 */
const processQueue = async (): Promise<void> => {
  if (isProcessingQueue) return;
  
  isProcessingQueue = true;
  
  while (prefetchQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
    // Sort queue by priority
    prefetchQueue.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2, auto: 3 };
      return (priorityOrder[a.options.priority || 'auto'] || 3) - 
             (priorityOrder[b.options.priority || 'auto'] || 3);
    });
    
    // Get the next item from the queue
    const { url, options } = prefetchQueue.shift()!;
    
    // Increment active requests counter
    activeRequests++;
    
    // Prefetch the resource
    prefetchResourceByType(url, options)
      .finally(() => {
        // Decrement active requests counter
        activeRequests--;
        
        // Continue processing the queue
        if (prefetchQueue.length > 0) {
          processQueue();
        }
      });
  }
  
  isProcessingQueue = false;
};

/**
 * Prefetch a resource using the appropriate method based on the resource type
 * @param url URL of the resource to prefetch
 * @param options Prefetch options
 * @returns Promise that resolves when the resource is prefetched
 */
const prefetchResourceByType = (
  url: string,
  options: PrefetchOptions
): Promise<void> => {
  switch (options.type) {
    case 'image':
      return prefetchImage(url);
    case 'script':
    case 'style':
    case 'font':
    case 'document':
      return prefetchWithLink(url, options);
    case 'fetch':
      return prefetchWithFetch(url, options.fetchOptions);
    default:
      return prefetchWithLink(url, options);
  }
};

/**
 * Prefetch an image
 * @param url URL of the image to prefetch
 * @returns Promise that resolves when the image is prefetched
 */
const prefetchImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve();
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to prefetch image: ${url}`));
    };
    
    img.src = url;
  });
};

/**
 * Prefetch a resource using a link element
 * @param url URL of the resource to prefetch
 * @param options Prefetch options
 * @returns Promise that resolves when the resource is prefetched
 */
const prefetchWithLink = (
  url: string,
  options: PrefetchOptions
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    
    link.rel = 'prefetch';
    link.href = url;
    
    if (options.as) {
      link.as = options.as;
    }
    
    if (options.crossOrigin) {
      link.crossOrigin = options.crossOrigin;
    }
    
    if (options.media) {
      link.media = options.media;
    }
    
    if (options.importance) {
      (link as any).importance = options.importance;
    }
    
    link.onload = () => {
      resolve();
    };
    
    link.onerror = () => {
      reject(new Error(`Failed to prefetch resource: ${url}`));
    };
    
    document.head.appendChild(link);
  });
};

/**
 * Prefetch a resource using fetch API
 * @param url URL of the resource to prefetch
 * @param options Fetch options
 * @returns Promise that resolves when the resource is prefetched
 */
const prefetchWithFetch = (
  url: string,
  options?: RequestInit
): Promise<void> => {
  return fetch(url, {
    ...options,
    method: 'GET',
    mode: 'cors',
    credentials: 'same-origin',
    cache: 'force-cache',
    priority: 'low',
  })
    .then(() => {
      // Resource is now in the browser cache
    })
    .catch((error) => {
      console.error(`Failed to prefetch resource: ${url}`, error);
    });
};

/**
 * Prefetch multiple resources
 * @param resources Array of resources to prefetch
 * @returns Promise that resolves when all resources are prefetched
 */
export const prefetchResources = (
  resources: Array<{ url: string; options: PrefetchOptions }>
): Promise<void[]> => {
  return Promise.all(
    resources.map(({ url, options }) => prefetchResource(url, options))
  );
};

/**
 * Prefetch resources for a specific route
 * @param route Route to prefetch resources for
 * @returns Promise that resolves when all resources are prefetched
 */
export const prefetchRoute = (route: string): Promise<void[]> => {
  // This would be populated with the resources needed for each route
  const routeResources: Record<string, Array<{ url: string; options: PrefetchOptions }>> = {
    '/': [
      { 
        url: '/static/images/hero.jpg', 
        options: { type: 'image', priority: 'high' } 
      },
      { 
        url: '/static/css/home.css', 
        options: { type: 'style', priority: 'high' } 
      },
    ],
    '/services': [
      { 
        url: '/static/images/services-banner.jpg', 
        options: { type: 'image', priority: 'high' } 
      },
      { 
        url: '/api/services', 
        options: { type: 'fetch', priority: 'high' } 
      },
    ],
    // Add more routes as needed
  };
  
  const resources = routeResources[route] || [];
  return prefetchResources(resources);
};

/**
 * Prefetch resources based on user navigation patterns
 * @param currentRoute Current route
 */
export const prefetchLikelyRoutes = (currentRoute: string): void => {
  // Define likely next routes based on the current route
  const likelyNextRoutes: Record<string, string[]> = {
    '/': ['/services', '/projects', '/about'],
    '/services': ['/projects', '/contact'],
    '/projects': ['/services', '/contact'],
    // Add more routes as needed
  };
  
  const routes = likelyNextRoutes[currentRoute] || [];
  
  // Prefetch resources for likely next routes
  routes.forEach(route => {
    prefetchRoute(route).catch(error => {
      console.error(`Failed to prefetch route: ${route}`, error);
    });
  });
};

export default {
  prefetchResource,
  prefetchResources,
  prefetchRoute,
  prefetchLikelyRoutes,
  isPrefetched,
};
