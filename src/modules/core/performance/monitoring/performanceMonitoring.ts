/**
 * Performance Monitoring
 * 
 * This utility provides performance monitoring tools.
 */

/**
 * Performance metric types
 */
export type PerformanceMetricType =
  | 'FCP' // First Contentful Paint
  | 'LCP' // Largest Contentful Paint
  | 'FID' // First Input Delay
  | 'CLS' // Cumulative Layout Shift
  | 'TTI' // Time to Interactive
  | 'TBT' // Total Blocking Time
  | 'TTFB' // Time to First Byte
  | 'custom'; // Custom metric

/**
 * Performance metric
 */
export interface PerformanceMetric {
  /** Metric name */
  name: string;
  /** Metric value */
  value: number;
  /** Metric type */
  type: PerformanceMetricType;
  /** Metric unit */
  unit: 'ms' | 'score' | 'count' | 'bytes' | 'percent' | 'custom';
  /** Timestamp when the metric was recorded */
  timestamp: number;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Performance monitoring options
 */
export interface PerformanceMonitoringOptions {
  /** Whether to enable performance monitoring */
  enabled?: boolean;
  /** Whether to log metrics to the console */
  logToConsole?: boolean;
  /** Whether to send metrics to the server */
  sendToServer?: boolean;
  /** Server endpoint to send metrics to */
  serverEndpoint?: string;
  /** Sampling rate (0-1) */
  samplingRate?: number;
  /** Whether to track web vitals */
  trackWebVitals?: boolean;
  /** Whether to track resource timing */
  trackResourceTiming?: boolean;
  /** Whether to track user timing */
  trackUserTiming?: boolean;
  /** Whether to track long tasks */
  trackLongTasks?: boolean;
  /** Whether to track memory usage */
  trackMemory?: boolean;
}

/**
 * Default performance monitoring options
 */
const defaultOptions: PerformanceMonitoringOptions = {
  enabled: true,
  logToConsole: false,
  sendToServer: false,
  serverEndpoint: '/api/performance',
  samplingRate: 1,
  trackWebVitals: true,
  trackResourceTiming: true,
  trackUserTiming: true,
  trackLongTasks: true,
  trackMemory: false
};

// Store metrics
const metrics: PerformanceMetric[] = [];

// Store options
let options: PerformanceMonitoringOptions = { ...defaultOptions };

/**
 * Initialize performance monitoring
 * 
 * @param customOptions - Performance monitoring options
 * 
 * @example
 * ```ts
 * // Initialize performance monitoring
 * initPerformanceMonitoring({
 *   logToConsole: true,
 *   sendToServer: true,
 *   serverEndpoint: '/api/performance'
 * });
 * ```
 */
export function initPerformanceMonitoring(
  customOptions: PerformanceMonitoringOptions = {}
): void {
  // Merge options
  options = { ...defaultOptions, ...customOptions };

  // Check if performance monitoring is enabled
  if (!options.enabled) return;

  // Check if performance API is supported
  if (!window.performance) {
    console.warn('Performance API is not supported in this browser');
    return;
  }

  // Apply sampling rate
  if (options.samplingRate !== undefined && Math.random() > options.samplingRate) {
    options.enabled = false;
    return;
  }

  // Track web vitals
  if (options.trackWebVitals) {
    trackWebVitals();
  }

  // Track resource timing
  if (options.trackResourceTiming) {
    trackResourceTiming();
  }

  // Track user timing
  if (options.trackUserTiming) {
    trackUserTiming();
  }

  // Track long tasks
  if (options.trackLongTasks) {
    trackLongTasks();
  }

  // Track memory usage
  if (options.trackMemory) {
    trackMemory();
  }
}

/**
 * Track web vitals
 */
function trackWebVitals(): void {
  // Track First Contentful Paint (FCP)
  const fcpObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    if (entries.length > 0) {
      const fcp = entries[0];
      trackMetric('FCP', fcp.startTime, 'FCP', 'ms');
    }
  });
  fcpObserver.observe({ type: 'paint', buffered: true });

  // Track Largest Contentful Paint (LCP)
  const lcpObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    if (entries.length > 0) {
      const lcp = entries[entries.length - 1];
      trackMetric('LCP', lcp.startTime, 'LCP', 'ms');
    }
  });
  lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

  // Track First Input Delay (FID)
  const fidObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    if (entries.length > 0) {
      const fid = entries[0];
      trackMetric('FID', fid.processingStart - fid.startTime, 'FID', 'ms');
    }
  });
  fidObserver.observe({ type: 'first-input', buffered: true });

  // Track Cumulative Layout Shift (CLS)
  let clsValue = 0;
  let clsEntries: PerformanceEntry[] = [];
  let sessionValue = 0;
  let sessionEntries: PerformanceEntry[] = [];
  let clsObserver: PerformanceObserver;

  const entryHandler = (entries: PerformanceEntry[]) => {
    entries.forEach(entry => {
      // Only count layout shifts without recent user input
      if (!(entry as any).hadRecentInput) {
        const firstSessionEntry = sessionEntries[0];
        const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
        
        // If the entry is less than 1 second after the previous entry and
        // less than 5 seconds after the first entry in the session,
        // include it in the session
        if (
          lastSessionEntry &&
          entry.startTime - lastSessionEntry.startTime < 1000 &&
          entry.startTime - firstSessionEntry.startTime < 5000
        ) {
          sessionValue += (entry as any).value;
          sessionEntries.push(entry);
        } else {
          // Start a new session
          sessionValue = (entry as any).value;
          sessionEntries = [entry];
        }
        
        // If the session value is larger than the current CLS value,
        // update the CLS value and entries
        if (sessionValue > clsValue) {
          clsValue = sessionValue;
          clsEntries = sessionEntries;
          
          // Report the updated CLS value
          trackMetric('CLS', clsValue, 'CLS', 'score');
        }
      }
    });
  };

  clsObserver = new PerformanceObserver(entryList => {
    entryHandler(entryList.getEntries());
  });
  clsObserver.observe({ type: 'layout-shift', buffered: true });
}

/**
 * Track resource timing
 */
function trackResourceTiming(): void {
  const resourceObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    entries.forEach(entry => {
      // Only track resources that took more than 100ms to load
      if (entry.duration > 100) {
        trackMetric(
          `Resource: ${entry.name}`,
          entry.duration,
          'custom',
          'ms',
          {
            initiatorType: entry.initiatorType,
            size: (entry as any).transferSize || 0
          }
        );
      }
    });
  });
  resourceObserver.observe({ type: 'resource', buffered: true });
}

/**
 * Track user timing
 */
function trackUserTiming(): void {
  const userTimingObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    entries.forEach(entry => {
      trackMetric(
        `User Timing: ${entry.name}`,
        entry.duration || entry.startTime,
        'custom',
        'ms'
      );
    });
  });
  userTimingObserver.observe({ type: 'measure', buffered: true });
  userTimingObserver.observe({ type: 'mark', buffered: true });
}

/**
 * Track long tasks
 */
function trackLongTasks(): void {
  const longTaskObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    entries.forEach(entry => {
      trackMetric(
        'Long Task',
        entry.duration,
        'TBT',
        'ms',
        {
          attribution: (entry as any).attribution
        }
      );
    });
  });
  longTaskObserver.observe({ type: 'longtask', buffered: true });
}

/**
 * Track memory usage
 */
function trackMemory(): void {
  // Check if memory API is supported
  if (!performance.memory) {
    console.warn('Memory API is not supported in this browser');
    return;
  }

  // Track memory usage every 10 seconds
  setInterval(() => {
    const memory = (performance as any).memory;
    trackMetric(
      'Memory Usage',
      memory.usedJSHeapSize,
      'custom',
      'bytes',
      {
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      }
    );
  }, 10000);
}

/**
 * Track a performance metric
 * 
 * @param name - Metric name
 * @param value - Metric value
 * @param type - Metric type
 * @param unit - Metric unit
 * @param metadata - Additional metadata
 * 
 * @example
 * ```ts
 * // Track a custom metric
 * trackMetric('Component Render', 150, 'custom', 'ms');
 * ```
 */
export function trackMetric(
  name: string,
  value: number,
  type: PerformanceMetricType = 'custom',
  unit: 'ms' | 'score' | 'count' | 'bytes' | 'percent' | 'custom' = 'ms',
  metadata?: Record<string, any>
): void {
  // Check if performance monitoring is enabled
  if (!options.enabled) return;

  // Create metric
  const metric: PerformanceMetric = {
    name,
    value,
    type,
    unit,
    timestamp: Date.now(),
    metadata
  };

  // Store metric
  metrics.push(metric);

  // Log metric to console
  if (options.logToConsole) {
    console.log(`[Performance] ${name}: ${value}${unit === 'ms' ? 'ms' : ''}`);
  }

  // Send metric to server
  if (options.sendToServer) {
    sendMetricToServer(metric);
  }
}

/**
 * Send a metric to the server
 * 
 * @param metric - Performance metric
 */
function sendMetricToServer(metric: PerformanceMetric): void {
  // Check if server endpoint is defined
  if (!options.serverEndpoint) return;

  // Send metric to server
  fetch(options.serverEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metric),
    // Use keepalive to ensure the request is sent even if the page is unloading
    keepalive: true
  }).catch(error => {
    console.error('Error sending metric to server:', error);
  });
}

/**
 * Measure the performance of a function
 * 
 * @param name - Metric name
 * @param fn - Function to measure
 * @param args - Function arguments
 * @returns Function result
 * 
 * @example
 * ```ts
 * // Measure the performance of a function
 * const result = measurePerformance('Heavy Computation', () => {
 *   // Heavy computation
 *   return computeResult();
 * });
 * ```
 */
export function measurePerformance<T>(
  name: string,
  fn: (...args: any[]) => T,
  ...args: any[]
): T {
  // Check if performance monitoring is enabled
  if (!options.enabled) {
    return fn(...args);
  }

  // Start performance measurement
  const start = performance.now();

  try {
    // Execute function
    const result = fn(...args);

    // End performance measurement
    const end = performance.now();
    const duration = end - start;

    // Track metric
    trackMetric(name, duration, 'custom', 'ms');

    return result;
  } catch (error) {
    // End performance measurement
    const end = performance.now();
    const duration = end - start;

    // Track metric with error
    trackMetric(name, duration, 'custom', 'ms', { error: true });

    // Rethrow error
    throw error;
  }
}

/**
 * Get all tracked metrics
 * 
 * @returns All tracked metrics
 * 
 * @example
 * ```ts
 * // Get all metrics
 * const allMetrics = getMetrics();
 * console.log('All metrics:', allMetrics);
 * ```
 */
export function getMetrics(): PerformanceMetric[] {
  return [...metrics];
}

/**
 * Clear all tracked metrics
 * 
 * @example
 * ```ts
 * // Clear all metrics
 * clearMetrics();
 * ```
 */
export function clearMetrics(): void {
  metrics.length = 0;
}

/**
 * Report performance metrics
 * 
 * @example
 * ```ts
 * // Report performance metrics
 * reportPerformance();
 * ```
 */
export function reportPerformance(): void {
  // Check if performance monitoring is enabled
  if (!options.enabled) return;

  // Get all metrics
  const allMetrics = getMetrics();

  // Log metrics to console
  if (options.logToConsole) {
    console.log('[Performance] All metrics:', allMetrics);
  }

  // Send metrics to server
  if (options.sendToServer && options.serverEndpoint) {
    fetch(options.serverEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ metrics: allMetrics }),
      keepalive: true
    }).catch(error => {
      console.error('Error sending metrics to server:', error);
    });
  }
}

export default {
  initPerformanceMonitoring,
  trackMetric,
  measurePerformance,
  getMetrics,
  clearMetrics,
  reportPerformance
};
