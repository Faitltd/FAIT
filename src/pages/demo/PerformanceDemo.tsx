/**
 * Performance Demo Page
 * 
 * This page demonstrates the performance optimization features.
 */

import React, { useState, useEffect, Suspense } from 'react';
import {
  lazyLoad,
  registerServiceWorker,
  OptimizedImage,
  createWorker,
  initPerformanceMonitoring,
  measurePerformance,
  trackMetric,
  reportPerformance
} from '../../modules/core/performance';
import { Container, Grid, Button } from '../../modules/core/components';

// Lazy load a heavy component
const LazyComponent = lazyLoad(() => import('./HeavyComponent'), {
  minDelay: 300,
  timeout: 5000,
  retryCount: 2
});

// Initialize performance monitoring
initPerformanceMonitoring({
  logToConsole: true,
  trackWebVitals: true,
  trackResourceTiming: true,
  trackLongTasks: true
});

/**
 * Performance Demo Page
 */
const PerformanceDemo: React.FC = () => {
  const [showLazyComponent, setShowLazyComponent] = useState(false);
  const [workerResult, setWorkerResult] = useState<number | null>(null);
  const [isWorkerRunning, setIsWorkerRunning] = useState(false);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<string>('Not registered');

  // Register service worker
  useEffect(() => {
    registerServiceWorker({
      onSuccess: () => setServiceWorkerStatus('Registered successfully'),
      onUpdate: () => setServiceWorkerStatus('Updated'),
      onError: () => setServiceWorkerStatus('Registration failed')
    });
  }, []);

  // Create a web worker for heavy computation
  const runHeavyComputation = () => {
    setIsWorkerRunning(true);
    trackMetric('Worker Start', performance.now(), 'custom', 'ms');

    // Create a worker
    const worker = createWorker(() => {
      // Worker code
      self.onmessage = (e) => {
        const { numbers } = e.data;
        
        // Simulate heavy computation
        let result = 0;
        for (let i = 0; i < 1000000000; i++) {
          result += i % 2 === 0 ? 1 : -1;
        }
        
        // Calculate sum of numbers
        const sum = numbers.reduce((acc: number, val: number) => acc + val, 0);
        
        self.postMessage({ result: sum + result });
      };
    });

    // Generate random numbers
    const numbers = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 100));

    // Send data to worker
    worker.postMessage({ numbers });

    // Handle worker response
    worker.onmessage = (e) => {
      setWorkerResult(e.data.result);
      setIsWorkerRunning(false);
      trackMetric('Worker End', performance.now(), 'custom', 'ms');
      worker.terminate();
    };
  };

  // Measure component render time
  useEffect(() => {
    measurePerformance('Component Render', () => {
      // Simulate some work
      let result = 0;
      for (let i = 0; i < 1000000; i++) {
        result += i;
      }
      return result;
    });
  }, []);

  // Toggle lazy component
  const handleToggleLazyComponent = () => {
    setShowLazyComponent(prev => !prev);
  };

  // Report performance metrics
  const handleReportPerformance = () => {
    reportPerformance();
  };

  return (
    <Container>
      <h1>Performance Optimization Demo</h1>
      
      <Grid columns={2} gap="2rem">
        <div>
          <h2>Code Splitting & Lazy Loading</h2>
          <p>
            This demo uses code splitting and lazy loading to load components on demand.
            Click the button below to load a heavy component.
          </p>
          <Button onClick={handleToggleLazyComponent}>
            {showLazyComponent ? 'Hide' : 'Show'} Lazy Component
          </Button>
          
          {showLazyComponent && (
            <Suspense fallback={<div>Loading...</div>}>
              <LazyComponent />
            </Suspense>
          )}
        </div>
        
        <div>
          <h2>Service Worker</h2>
          <p>
            This demo uses a service worker for offline support and caching.
            Current status: <strong>{serviceWorkerStatus}</strong>
          </p>
          <p>
            Try refreshing the page with the network disabled to see offline support in action.
          </p>
        </div>
        
        <div>
          <h2>Image Optimization</h2>
          <p>
            This demo uses optimized images with lazy loading and responsive images.
          </p>
          <div style={{ height: '200px' }}>
            <OptimizedImage
              src="/images/hero.jpg"
              alt="Hero image"
              placeholder="/images/hero-placeholder.jpg"
              lazy
              fadeIn
              srcSet="/images/hero-small.jpg 480w, /images/hero-medium.jpg 768w, /images/hero.jpg 1080w"
              sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
              webp
            />
          </div>
        </div>
        
        <div>
          <h2>Web Workers</h2>
          <p>
            This demo uses web workers for computationally intensive tasks.
            Click the button below to run a heavy computation in a web worker.
          </p>
          <Button 
            onClick={runHeavyComputation} 
            disabled={isWorkerRunning}
            loading={isWorkerRunning}
          >
            Run Heavy Computation
          </Button>
          
          {workerResult !== null && (
            <p>Result: {workerResult}</p>
          )}
        </div>
        
        <div>
          <h2>Performance Monitoring</h2>
          <p>
            This demo uses performance monitoring to track and report performance metrics.
            Click the button below to report performance metrics to the console.
          </p>
          <Button onClick={handleReportPerformance}>
            Report Performance Metrics
          </Button>
        </div>
      </Grid>
    </Container>
  );
};

export default PerformanceDemo;
