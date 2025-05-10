# Performance Module

This module provides performance optimization utilities for the FAIT Co-op platform. It includes code splitting, lazy loading, service worker, and performance monitoring tools.

## Features

- Code splitting and lazy loading
- Service worker for offline support
- Image optimization
- Web workers for computationally intensive tasks
- Performance monitoring and metrics

## Directory Structure

```
/performance
  /code-splitting     # Code splitting utilities
  /service-worker     # Service worker implementation
  /image-optimization # Image optimization utilities
  /web-workers        # Web worker implementations
  /monitoring         # Performance monitoring tools
  /metrics            # Performance metrics collection
  index.ts            # Public API exports
```

## Usage Guidelines

### Code Splitting

Use the `lazyLoad` utility to lazy load components:

```tsx
import { lazyLoad } from '@/modules/core/performance';

// Lazy load a component
const LazyComponent = lazyLoad(() => import('./HeavyComponent'));

// Use with suspense
function MyComponent() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}
```

### Service Worker

Register the service worker for offline support:

```tsx
import { registerServiceWorker } from '@/modules/core/performance';

// Register service worker
registerServiceWorker({
  onSuccess: () => console.log('Service worker registered'),
  onUpdate: () => console.log('Service worker updated')
});
```

### Image Optimization

Use the `OptimizedImage` component for responsive images:

```tsx
import { OptimizedImage } from '@/modules/core/performance';

// Use optimized image
function MyComponent() {
  return (
    <OptimizedImage
      src="/images/hero.jpg"
      alt="Hero image"
      sizes="(max-width: 768px) 100vw, 50vw"
      loading="lazy"
      placeholder="/images/hero-placeholder.jpg"
    />
  );
}
```

### Web Workers

Use web workers for computationally intensive tasks:

```tsx
import { createWorker } from '@/modules/core/performance';

// Create a web worker
const worker = createWorker(() => {
  // Worker code
  self.onmessage = (e) => {
    const result = heavyComputation(e.data);
    self.postMessage(result);
  };
});

// Use the worker
worker.postMessage(data);
worker.onmessage = (e) => {
  console.log('Result:', e.data);
};
```

### Performance Monitoring

Monitor performance metrics:

```tsx
import { 
  measurePerformance, 
  trackMetric, 
  reportPerformance 
} from '@/modules/core/performance';

// Measure performance
measurePerformance('componentRender', () => {
  // Component rendering code
});

// Track a metric
trackMetric('timeToInteractive', 1200);

// Report performance metrics
reportPerformance();
```

## Best Practices

1. **Route-based Code Splitting**: Split code at the route level to reduce initial bundle size.
2. **Component-based Code Splitting**: Lazy load heavy components that are not needed immediately.
3. **Critical CSS**: Inline critical CSS and defer non-critical CSS.
4. **Image Optimization**: Use responsive images with appropriate sizes and formats.
5. **Web Workers**: Move computationally intensive tasks to web workers.
6. **Performance Budgets**: Set and enforce performance budgets for bundle sizes.
7. **Monitoring**: Continuously monitor performance metrics in production.

## Performance Metrics

The module tracks the following performance metrics:

1. **First Contentful Paint (FCP)**: Time until the first content is painted.
2. **Largest Contentful Paint (LCP)**: Time until the largest content is painted.
3. **First Input Delay (FID)**: Time until the page responds to user input.
4. **Cumulative Layout Shift (CLS)**: Measure of visual stability.
5. **Time to Interactive (TTI)**: Time until the page is fully interactive.
6. **Total Blocking Time (TBT)**: Total time the main thread is blocked.

## Service Worker Features

The service worker provides the following features:

1. **Offline Support**: Cache critical assets for offline use.
2. **Cache-First Strategy**: Serve cached assets first, then update from network.
3. **Background Sync**: Queue requests when offline and send when online.
4. **Push Notifications**: Support for push notifications.
5. **Precaching**: Precache critical assets during installation.
6. **Runtime Caching**: Cache assets at runtime based on strategies.

## Web Worker Features

The web worker utilities provide the following features:

1. **Worker Pool**: Pool of workers for parallel processing.
2. **Shared Workers**: Share workers between multiple tabs.
3. **Worker Termination**: Automatically terminate idle workers.
4. **Error Handling**: Handle worker errors gracefully.
5. **Progress Tracking**: Track progress of long-running tasks.
6. **Transferable Objects**: Optimize data transfer with transferable objects.
