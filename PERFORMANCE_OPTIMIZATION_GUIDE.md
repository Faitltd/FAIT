# FAIT Co-op Performance Optimization Guide

This guide provides detailed instructions for optimizing the performance of the FAIT Co-op platform, addressing the specific issues identified in the performance analysis.

## Table of Contents

1. [Current Performance Issues](#current-performance-issues)
2. [Bundle Size Optimization](#bundle-size-optimization)
3. [Code Splitting Strategies](#code-splitting-strategies)
4. [Lazy Loading Components](#lazy-loading-components)
5. [Web Worker Usage](#web-worker-usage)
6. [Image Optimization](#image-optimization)
7. [Service Worker Implementation](#service-worker-implementation)
8. [Performance Monitoring](#performance-monitoring)
9. [Testing Performance Improvements](#testing-performance-improvements)

## Current Performance Issues

The performance analysis identified the following issues:

- **Large Chunk Sizes**: Some chunks are larger than 500 KB after minification
- **Performance Budget Violations**:
  - Main entrypoint size: 566.17 KB (exceeds budget of 244.14 KB by 322.03 KB)
  - Main JavaScript file (index-Cv5VgSEc.js): 489.79 KB (exceeds budget by 245.65 KB)
- **Large Dependencies**: FullCalendar components are among the top 5 largest dependencies

## Bundle Size Optimization

### Vite Configuration

The Vite configuration has been updated to implement manual chunking for better code splitting:

```javascript
// vite.config.ts
export default defineConfig({
  // ...
  build: {
    chunkSizeWarningLimit: 350, // Increase from default 500kb to 350kb
    rollupOptions: {
      output: {
        manualChunks: {
          // Framework chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI library chunks
          'ui-vendor': ['framer-motion', '@radix-ui/react-dialog', ...],
          
          // Calendar chunks
          'calendar-vendor': [
            '@fullcalendar/core',
            '@fullcalendar/daygrid',
            '@fullcalendar/interaction',
            '@fullcalendar/react',
            '@fullcalendar/timegrid'
          ],
          
          // Utility chunks
          'utils-vendor': ['date-fns', 'lodash-es', 'uuid'],
          
          // Map chunks
          'maps-vendor': ['@googlemaps/markerclusterer', '@react-google-maps/api'],
        }
      }
    }
  }
});
```

### Analyzing Dependencies

Run the dependency analysis script to identify large dependencies:

```bash
npm run perf:analyze-deps
```

This will provide recommendations for optimizing specific dependencies.

## Code Splitting Strategies

### Route-Based Splitting

Implement route-based code splitting using React's lazy loading:

```javascript
// Instead of
import ProjectsPage from './pages/projects/ProjectsPage';

// Use
const ProjectsPage = lazy(() => import('./pages/projects/ProjectsPage'));
```

### Component-Based Splitting

Split large components into smaller chunks:

```javascript
// Instead of importing the entire component
import FullCalendar from '@fullcalendar/react';

// Create a separate component that lazy loads FullCalendar
const FullCalendarComponent = lazy(() => import('./FullCalendarComponent'));
```

## Lazy Loading Components

### Using the Advanced Lazy Loading Utility

The project includes an advanced lazy loading utility (`advancedLazyLoading.ts`) that provides:

- Preloading of critical components
- Prefetching during browser idle time
- Named chunks for better debugging
- Error handling with retry logic

Example usage:

```javascript
import { lazyLoad } from './utils/advancedLazyLoading';

const MyComponent = lazyLoad(
  () => import('./MyComponent'),
  {
    name: 'MyComponent',
    preload: false,
    fallback: <LoadingPlaceholder />
  }
);
```

### Lazy Loading FullCalendar

The FullCalendarBooking component has been updated to use lazy loading:

```javascript
// Lazy load FullCalendar and its plugins
const FullCalendarComponent = lazy(() => import('./LazyFullCalendar'));

// Use in JSX with Suspense
<Suspense fallback={<LoadingPlaceholder />}>
  <FullCalendarComponent
    events={events}
    options={options}
  />
</Suspense>
```

## Web Worker Usage

### Available Web Workers

The project includes several web workers for CPU-intensive tasks:

- **Image Worker**: For image processing tasks
- **Data Worker**: For data processing tasks
- **Maps Worker**: For map-related tasks
- **Computation Worker**: For general computation tasks

### Using Web Workers

Use the `useWebWorker` hook to run tasks in a web worker:

```javascript
import { useWebWorker, WorkerType } from '../../utils/webWorkerRegistry';

const { runTask, isSupported } = useWebWorker(WorkerType.DATA);

// Run a task in the worker
const result = await runTask('filter', {
  items: data,
  filters: { status: 'active' }
});
```

## Image Optimization

### Using the OptimizedImage Component

The project includes an `OptimizedImage` component that provides:

- Responsive images with srcset and sizes attributes
- Modern format support (WebP, AVIF)
- Lazy loading with Intersection Observer
- Blur-up loading technique

Example usage:

```javascript
<OptimizedImage
  src="/path/to/image.jpg"
  alt="Description"
  lazy={true}
  blurUp={true}
  responsive={true}
/>
```

## Service Worker Implementation

### Registering the Service Worker

The service worker is registered in `main.tsx`:

```javascript
import { registerServiceWorker } from './utils/serviceWorkerRegistration';

// Register service worker
registerServiceWorker({
  onSuccess: (reg) => {
    console.log('Service worker registered successfully:', reg);
  },
  onError: (error) => {
    console.error('Service worker registration failed:', error);
  }
});
```

### Building with PWA Support

To build the application with PWA support:

```bash
npm run pwa:build
```

## Performance Monitoring

### Running Performance Tests

```bash
# Run performance tests
npm run perf:test

# Monitor performance
npm run perf:monitor

# Analyze bundle
npm run webpack:perf:analyze

# Analyze dependencies
npm run perf:analyze-deps
```

## Testing Performance Improvements

After implementing performance optimizations, run the performance tests to measure the impact:

```bash
npm run perf:test
```

Compare the results with the previous measurements to verify the improvements.

## Next Steps

1. **Further Reduce Main Bundle Size**:
   - Analyze the bundle to identify remaining large dependencies
   - Implement more aggressive code splitting
   - Consider replacing large libraries with smaller alternatives

2. **Optimize FullCalendar Integration**:
   - Ensure all FullCalendar usages are lazy loaded
   - Import only the specific modules needed
   - Consider a lightweight placeholder until the full component is needed

3. **Enhance Web Worker Usage**:
   - Identify more CPU-intensive tasks for web workers
   - Optimize web worker communication
   - Add fallbacks for browsers without web worker support

4. **Implement Real User Monitoring**:
   - Track Core Web Vitals
   - Implement custom performance metrics
   - Set up performance dashboards
