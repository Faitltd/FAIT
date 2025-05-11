# Performance Optimization Refactoring

This document outlines the performance optimization refactoring in the FAIT Co-op platform.

## Overview

The performance optimization refactoring aims to improve the application's performance, responsiveness, and user experience. The new system provides tools for code splitting, lazy loading, service workers, image optimization, web workers, and performance monitoring.

## Key Changes

1. **Code Splitting and Lazy Loading**: Implemented utilities for code splitting and lazy loading to reduce initial bundle size.

2. **Service Worker Support**: Added service worker utilities for offline support, caching, and background sync.

3. **Image Optimization**: Created an optimized image component with responsive images, lazy loading, and placeholder support.

4. **Web Workers**: Implemented web worker utilities for moving computationally intensive tasks off the main thread.

5. **Performance Monitoring**: Added performance monitoring tools to track and report performance metrics.

## Directory Structure

```
src/modules/core/performance/
  ├── code-splitting/      # Code splitting utilities
  │   ├── lazyLoad.tsx     # Lazy loading utility
  │   └── index.ts         # Code splitting barrel file
  ├── service-worker/      # Service worker utilities
  │   ├── registerServiceWorker.ts # Service worker registration
  │   └── index.ts         # Service worker barrel file
  ├── image-optimization/  # Image optimization utilities
  │   ├── OptimizedImage.tsx # Optimized image component
  │   └── index.ts         # Image optimization barrel file
  ├── web-workers/         # Web worker utilities
  │   ├── createWorker.ts  # Web worker creation utility
  │   └── index.ts         # Web workers barrel file
  ├── monitoring/          # Performance monitoring tools
  │   ├── performanceMonitoring.ts # Performance monitoring utility
  │   └── index.ts         # Monitoring barrel file
  ├── index.ts             # Performance module barrel file
  └── README.md            # Performance module documentation
```

## Usage

### Code Splitting and Lazy Loading

```tsx
import { lazyLoad, preloadModule } from '@/modules/core/performance';

// Lazy load a component
const LazyComponent = lazyLoad(() => import('./HeavyComponent'), {
  minDelay: 300,
  timeout: 5000,
  retryCount: 2,
  preload: false
});

// Use with suspense
function MyComponent() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}

// Preload a module on hover
function MyLink() {
  const handleMouseEnter = () => {
    preloadModule(() => import('./PageToPreload'));
  };
  
  return (
    <Link to="/page" onMouseEnter={handleMouseEnter}>
      Go to Page
    </Link>
  );
}
```

### Service Worker

```tsx
import { registerServiceWorker, unregisterServiceWorker } from '@/modules/core/performance';

// Register service worker
registerServiceWorker({
  path: '/service-worker.js',
  scope: '/',
  onSuccess: (registration) => console.log('Service worker registered'),
  onUpdate: (registration) => console.log('Service worker updated'),
  onError: (error) => console.error('Service worker registration failed:', error)
});

// Unregister service worker
unregisterServiceWorker()
  .then(() => console.log('Service worker unregistered'))
  .catch(error => console.error('Error unregistering service worker:', error));
```

### Image Optimization

```tsx
import { OptimizedImage } from '@/modules/core/performance';

function MyComponent() {
  return (
    <OptimizedImage
      src="/images/hero.jpg"
      alt="Hero image"
      placeholder="/images/hero-placeholder.jpg"
      lazy
      fadeIn
      srcSet="/images/hero-small.jpg 480w, /images/hero-medium.jpg 768w, /images/hero.jpg 1080w"
      sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
      webp
      avif
    />
  );
}
```

### Web Workers

```tsx
import { createWorker, createWorkerPool } from '@/modules/core/performance';

// Create a worker
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

// Create a worker pool
const pool = createWorkerPool(() => {
  // Worker code
  self.onmessage = (e) => {
    const result = heavyComputation(e.data);
    self.postMessage(result);
  };
}, 4);

// Process data in parallel
pool.process([data1, data2, data3, data4])
  .then(results => console.log('Results:', results))
  .catch(error => console.error('Error:', error));
```

### Performance Monitoring

```tsx
import {
  initPerformanceMonitoring,
  trackMetric,
  measurePerformance,
  reportPerformance
} from '@/modules/core/performance';

// Initialize performance monitoring
initPerformanceMonitoring({
  logToConsole: true,
  sendToServer: true,
  serverEndpoint: '/api/performance',
  trackWebVitals: true,
  trackResourceTiming: true,
  trackLongTasks: true
});

// Track a custom metric
trackMetric('Component Render', 150, 'custom', 'ms');

// Measure the performance of a function
const result = measurePerformance('Heavy Computation', () => {
  // Heavy computation
  return computeResult();
});

// Report performance metrics
reportPerformance();
```

## Performance Metrics

The performance monitoring system tracks the following metrics:

1. **First Contentful Paint (FCP)**: Time until the first content is painted.
2. **Largest Contentful Paint (LCP)**: Time until the largest content is painted.
3. **First Input Delay (FID)**: Time until the page responds to user input.
4. **Cumulative Layout Shift (CLS)**: Measure of visual stability.
5. **Time to Interactive (TTI)**: Time until the page is fully interactive.
6. **Total Blocking Time (TBT)**: Total time the main thread is blocked.
7. **Resource Timing**: Timing information for resource loading.
8. **User Timing**: Custom timing marks and measures.
9. **Long Tasks**: Tasks that block the main thread for more than 50ms.
10. **Memory Usage**: JavaScript heap size and usage.

## Best Practices

### Code Splitting

1. **Route-based Splitting**: Split code at the route level to reduce initial bundle size.
2. **Component-based Splitting**: Lazy load heavy components that are not needed immediately.
3. **Preloading**: Preload critical resources and modules that will be needed soon.
4. **Error Handling**: Handle loading errors gracefully with retry mechanisms.

### Service Worker

1. **Offline Support**: Cache critical assets for offline use.
2. **Cache-First Strategy**: Serve cached assets first, then update from network.
3. **Background Sync**: Queue requests when offline and send when online.
4. **Precaching**: Precache critical assets during installation.

### Image Optimization

1. **Responsive Images**: Use srcSet and sizes attributes for responsive images.
2. **Lazy Loading**: Lazy load images that are not in the viewport.
3. **Placeholders**: Use low-quality placeholders while loading.
4. **Modern Formats**: Use WebP and AVIF formats for smaller file sizes.

### Web Workers

1. **Computationally Intensive Tasks**: Move heavy computations to web workers.
2. **Data Processing**: Process large datasets in web workers.
3. **Worker Pools**: Use worker pools for parallel processing.
4. **Transferable Objects**: Use transferable objects for efficient data transfer.

### Performance Monitoring

1. **Web Vitals**: Track core web vitals (LCP, FID, CLS).
2. **Custom Metrics**: Track custom metrics for specific components and features.
3. **Resource Timing**: Monitor resource loading performance.
4. **Long Tasks**: Identify and optimize long-running tasks.

## Migration Guide

To migrate existing code to use the new performance optimizations:

1. **Code Splitting**: Replace dynamic imports with the `lazyLoad` utility.
2. **Service Worker**: Register the service worker using the `registerServiceWorker` utility.
3. **Image Optimization**: Replace `<img>` tags with the `OptimizedImage` component.
4. **Web Workers**: Replace custom web worker implementations with the `createWorker` utility.
5. **Performance Monitoring**: Initialize performance monitoring and track metrics.

## Next Steps

1. **Bundle Analysis**: Analyze the bundle size and identify opportunities for further optimization.
2. **Critical CSS**: Extract and inline critical CSS for faster rendering.
3. **Font Optimization**: Optimize font loading with font-display and preloading.
4. **Third-party Scripts**: Optimize loading of third-party scripts.
5. **Server-side Rendering**: Implement server-side rendering for faster initial load.
6. **Performance Budgets**: Set and enforce performance budgets for bundle sizes and metrics.
