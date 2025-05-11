# FAIT Co-op Performance Optimizations

This document provides an overview of the performance optimizations implemented in the FAIT Co-op platform, including code splitting, tree shaking, service worker implementation, image optimization, and web worker usage.

## Table of Contents

1. [Performance Budget](#performance-budget)
2. [Code Splitting](#code-splitting)
3. [Service Worker](#service-worker)
4. [Image Optimization](#image-optimization)
5. [Web Workers](#web-workers)
6. [Performance Monitoring](#performance-monitoring)
7. [Usage Instructions](#usage-instructions)

## Performance Budget

The FAIT Co-op platform has the following performance budgets:

- **Max Entrypoint Size**: 250 KB
- **Max Asset Size**: 250 KB
- **Max Initial Chunk Size**: 250 KB
- **Max Async Chunk Size**: 100 KB

These budgets are enforced during the build process and can be monitored using the performance monitoring tools.

## Code Splitting

The platform uses advanced code splitting techniques to reduce the initial bundle size and improve loading performance:

### Route-Based Splitting

All routes are lazy-loaded using the `lazyLoad` utility, which provides:

- **Preloading**: Critical components are preloaded for faster navigation
- **Prefetching**: Components are loaded during browser idle time
- **Named Chunks**: Better debugging and monitoring
- **Error Handling**: Graceful failure with retry logic

### Component-Based Splitting

Large components are split into smaller chunks using:

- **Dynamic Imports**: Components are loaded on demand
- **Suspense**: Better loading experience with fallbacks
- **Lazy Loading**: Components are loaded when they become visible

### Vendor Splitting

Third-party dependencies are split into separate chunks:

- **Framework**: React, ReactDOM, etc.
- **UI Libraries**: Framer Motion, Radix UI, etc.
- **Utilities**: Date-fns, Lodash, etc.
- **Maps**: Google Maps libraries

## Service Worker

The platform uses a service worker for offline support and improved caching:

### Caching Strategies

- **Static Assets**: Cache-first strategy for better performance
- **API Requests**: Network-first strategy for fresh data
- **Images**: Cache-first strategy with background updates
- **Fonts**: Cache-first strategy for better performance

### Offline Support

- **Offline Page**: Custom offline page with cached content
- **Background Sync**: Messages and bookings are synced when online
- **Push Notifications**: Users are notified of important events

### Installation

The service worker is automatically registered when the application loads. No additional steps are required.

## Image Optimization

The platform uses advanced image optimization techniques:

### Responsive Images

- **Srcset**: Images are loaded at the appropriate size for the device
- **Sizes**: Browser knows which image to load based on the viewport
- **Modern Formats**: WebP and AVIF support with fallbacks

### Lazy Loading

- **Intersection Observer**: Images are loaded when they become visible
- **Blur-Up**: Low-quality placeholders are shown while loading
- **Priority**: Critical images are loaded first

### Usage

Use the `OptimizedImage` component for all images:

```jsx
<OptimizedImage
  src="/path/to/image.jpg"
  alt="Description"
  lazy={true}
  blurUp={true}
  responsive={true}
/>
```

## Web Workers

The platform uses web workers for CPU-intensive tasks:

### Image Processing

- **Resizing**: Images are resized in a web worker
- **Compression**: Images are compressed in a web worker
- **Filters**: Image filters are applied in a web worker

### Data Processing

- **Filtering**: Data is filtered in a web worker
- **Sorting**: Data is sorted in a web worker
- **Searching**: Search operations are performed in a web worker

### Maps Processing

- **Clustering**: Marker clustering is performed in a web worker
- **Geocoding**: Geocoding is performed in a web worker
- **Distance Calculation**: Distance calculations are performed in a web worker

### Usage

Use the `useWebWorker` hook for web worker operations:

```jsx
const { runTask, isSupported } = useWebWorker(WorkerType.IMAGE);

const handleImageResize = async (imageData, width, height) => {
  if (!isSupported) {
    // Fallback to main thread
    return resizeImageOnMainThread(imageData, width, height);
  }
  
  return await runTask('resize', { imageData, width, height });
};
```

## Performance Monitoring

The platform includes tools for monitoring performance:

### Build-Time Monitoring

- **Bundle Analysis**: Analyze the bundle size and composition
- **Performance Budget**: Check for performance budget violations
- **Dependency Analysis**: Identify large dependencies

### Runtime Monitoring

- **Core Web Vitals**: Monitor LCP, FID, and CLS
- **Custom Metrics**: Monitor application-specific metrics
- **User Timing**: Measure performance of specific operations

## Usage Instructions

### Running Performance Tests

```bash
# Run performance tests
npm run perf:test

# Monitor performance
npm run perf:monitor

# Analyze bundle
npm run webpack:perf:analyze
```

### Building with Performance Optimizations

```bash
# Build with performance optimizations
npm run perf:build

# Build with PWA support
npm run pwa:build
```

### Automated Optimization

Use the provided script to run tests and apply optimizations:

```bash
./optimize-performance.sh
```

This script will:
1. Run performance tests
2. Check for performance budget violations
3. Apply performance optimizations
4. Build with PWA support
5. Analyze the bundle

## Conclusion

By implementing these performance optimizations, the FAIT Co-op platform provides a fast, responsive, and reliable experience for users, even in challenging network conditions.
