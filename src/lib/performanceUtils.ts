/**
 * Advanced performance monitoring utilities for the FAIT Co-Op Platform
 */

/**
 * Performance metrics for a component or operation
 */
export interface PerformanceMetrics {
  /** Component or operation name */
  name: string;
  /** Start time in milliseconds */
  startTime: number;
  /** End time in milliseconds */
  endTime?: number;
  /** Duration in milliseconds */
  duration?: number;
  /** Additional metadata */
  metadata?: Record<string, any>;
  /** Unique identifier for the metric */
  id?: string;
  /** Resource usage information */
  resources?: {
    /** Memory usage in MB */
    memory?: number;
    /** CPU usage percentage */
    cpu?: number;
    /** Network requests count */
    networkRequests?: number;
    /** Network data transferred in bytes */
    networkBytes?: number;
  };
}

/**
 * Performance monitoring class
 */
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private activeMetrics: Map<string, PerformanceMetrics> = new Map();
  private isEnabled: boolean = true;
  private logToConsole: boolean = false;
  private maxMetricsCount: number = 1000;
  private slowThreshold: number = 300; // ms
  private reportToServer: boolean = false;
  private reportEndpoint: string = '/api/performance-metrics';
  private samplingRate: number = 1.0; // 1.0 = 100% of metrics are collected
  private resourceMonitoring: boolean = false;
  private metricListeners: Array<(metric: PerformanceMetrics) => void> = [];

  /**
   * Configure the performance monitor
   */
  configure(options: {
    enabled?: boolean;
    logToConsole?: boolean;
    maxMetricsCount?: number;
    slowThreshold?: number;
    reportToServer?: boolean;
    reportEndpoint?: string;
    samplingRate?: number;
    resourceMonitoring?: boolean;
  }): void {
    if (options.enabled !== undefined) {
      this.isEnabled = options.enabled;
    }
    if (options.logToConsole !== undefined) {
      this.logToConsole = options.logToConsole;
    }
    if (options.maxMetricsCount !== undefined) {
      this.maxMetricsCount = options.maxMetricsCount;
    }
    if (options.slowThreshold !== undefined) {
      this.slowThreshold = options.slowThreshold;
    }
    if (options.reportToServer !== undefined) {
      this.reportToServer = options.reportToServer;
    }
    if (options.reportEndpoint !== undefined) {
      this.reportEndpoint = options.reportEndpoint;
    }
    if (options.samplingRate !== undefined) {
      this.samplingRate = Math.max(0, Math.min(1, options.samplingRate));
    }
    if (options.resourceMonitoring !== undefined) {
      this.resourceMonitoring = options.resourceMonitoring;
    }

    // Initialize resource monitoring if enabled
    if (this.resourceMonitoring && typeof window !== 'undefined') {
      this.initResourceMonitoring();
    }
  }

  /**
   * Initialize resource monitoring
   */
  private initResourceMonitoring(): void {
    // Use Performance Observer API if available
    if ('PerformanceObserver' in window) {
      try {
        // Monitor resource timing
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          for (const entry of entries) {
            if (entry.entryType === 'resource') {
              this.recordResourceTiming(entry as PerformanceResourceTiming);
            }
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });

        // Monitor long tasks
        if ('PerformanceLongTaskTiming' in window) {
          const longTaskObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            for (const entry of entries) {
              this.recordLongTask(entry);
            }
          });
          longTaskObserver.observe({ entryTypes: ['longtask'] });
        }
      } catch (e) {
        console.warn('Failed to initialize PerformanceObserver:', e);
      }
    }
  }

  /**
   * Record resource timing information
   */
  private recordResourceTiming(entry: PerformanceResourceTiming): void {
    // Only record if sampling passes
    if (Math.random() > this.samplingRate) return;

    const url = new URL(entry.name);
    const metricName = `resource:${url.hostname}${url.pathname}`;

    this.metrics.push({
      name: metricName,
      startTime: entry.startTime,
      endTime: entry.startTime + entry.duration,
      duration: entry.duration,
      metadata: {
        url: entry.name,
        initiatorType: entry.initiatorType,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        decodedBodySize: entry.decodedBodySize
      },
      resources: {
        networkBytes: entry.transferSize,
        networkRequests: 1
      }
    });

    // Trim metrics if needed
    this.trimMetrics();
  }

  /**
   * Record long task information
   */
  private recordLongTask(entry: PerformanceEntry): void {
    // Only record if sampling passes
    if (Math.random() > this.samplingRate) return;

    this.metrics.push({
      name: `longtask:${entry.name || 'unknown'}`,
      startTime: entry.startTime,
      endTime: entry.startTime + entry.duration,
      duration: entry.duration,
      metadata: {
        attribution: (entry as any).attribution
      }
    });

    // Log long tasks
    if (this.logToConsole) {
      console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
    }

    // Trim metrics if needed
    this.trimMetrics();
  }

  /**
   * Trim metrics array if it exceeds the maximum size
   */
  private trimMetrics(): void {
    if (this.metrics.length > this.maxMetricsCount) {
      this.metrics = this.metrics.slice(-this.maxMetricsCount);
    }
  }

  /**
   * Start measuring performance for an operation
   */
  start(name: string, metadata?: Record<string, any>): string {
    if (!this.isEnabled || Math.random() > this.samplingRate) return name;

    // Generate a unique ID for this metric
    const id = `${name}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const metric: PerformanceMetrics = {
      name,
      startTime: performance.now(),
      metadata,
      id
    };

    // Store in active metrics map
    this.activeMetrics.set(id, metric);

    // Also add to metrics array
    this.metrics.push(metric);

    // Trim metrics array if needed
    this.trimMetrics();

    return id;
  }

  /**
   * End measuring performance for an operation
   */
  end(id: string, additionalMetadata?: Record<string, any>): PerformanceMetrics | null {
    if (!this.isEnabled) return null;

    // First check in active metrics map
    const metric = this.activeMetrics.get(id);

    if (!metric) {
      // Fall back to searching by name for backward compatibility
      const metricIndex = this.metrics.findIndex(
        (m) => m.name === id && !m.endTime
      );

      if (metricIndex === -1) {
        console.warn(`Performance metric "${id}" not found or already ended`);
        return null;
      }

      const foundMetric = this.metrics[metricIndex];
      foundMetric.endTime = performance.now();
      foundMetric.duration = foundMetric.endTime - foundMetric.startTime;

      if (additionalMetadata) {
        foundMetric.metadata = { ...foundMetric.metadata, ...additionalMetadata };
      }

      this.processCompletedMetric(foundMetric);
      return foundMetric;
    }

    // Update the metric
    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata };
    }

    // Add memory usage if available
    if (this.resourceMonitoring && (performance as any).memory) {
      const memoryInfo = (performance as any).memory;
      metric.resources = {
        ...metric.resources,
        memory: Math.round(memoryInfo.usedJSHeapSize / (1024 * 1024)) // Convert to MB
      };
    }

    // Remove from active metrics
    this.activeMetrics.delete(id);

    // Process the completed metric
    this.processCompletedMetric(metric);

    return metric;
  }

  /**
   * Process a completed metric
   */
  private processCompletedMetric(metric: PerformanceMetrics): void {
    // Log slow operations
    if (this.logToConsole && metric.duration && metric.duration > this.slowThreshold) {
      console.warn(
        `Slow operation detected: ${metric.name} took ${metric.duration.toFixed(2)}ms`,
        metric.metadata
      );
    }

    // Report to server if enabled
    if (this.reportToServer && metric.duration) {
      this.reportMetricToServer(metric);
    }

    // Notify listeners
    for (const listener of this.metricListeners) {
      try {
        listener(metric);
      } catch (e) {
        console.error('Error in performance metric listener:', e);
      }
    }
  }

  /**
   * Report a metric to the server
   */
  private reportMetricToServer(metric: PerformanceMetrics): void {
    // Skip very fast operations to reduce noise
    if (!metric.duration || metric.duration < 10) return;

    // Use sendBeacon if available for non-blocking reporting
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob(
          [JSON.stringify({
            name: metric.name,
            duration: metric.duration,
            timestamp: new Date().toISOString(),
            resources: metric.resources,
            metadata: {
              url: window.location.href,
              userAgent: navigator.userAgent,
              ...metric.metadata
            }
          })],
          { type: 'application/json' }
        );

        navigator.sendBeacon(this.reportEndpoint, blob);
        return;
      } catch (e) {
        console.warn('Failed to use sendBeacon for metric reporting:', e);
      }
    }

    // Fall back to fetch API
    try {
      fetch(this.reportEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: metric.name,
          duration: metric.duration,
          timestamp: new Date().toISOString(),
          resources: metric.resources,
          metadata: {
            url: window.location.href,
            userAgent: navigator.userAgent,
            ...metric.metadata
          }
        }),
        // Use keepalive to allow the request to complete even if the page is unloading
        keepalive: true
      }).catch(e => console.warn('Failed to report metric:', e));
    } catch (e) {
      console.warn('Failed to report metric:', e);
    }
  }

  /**
   * Measure the execution time of a function
   */
  measure<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    if (!this.isEnabled || Math.random() > this.samplingRate) return fn();

    const id = this.start(name, metadata);
    try {
      const result = fn();
      this.end(id);
      return result;
    } catch (error) {
      this.end(id, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * Measure the execution time of an async function
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.isEnabled || Math.random() > this.samplingRate) return fn();

    const id = this.start(name, metadata);
    try {
      const result = await fn();
      this.end(id);
      return result;
    } catch (error) {
      this.end(id, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * Add a listener for completed metrics
   */
  addMetricListener(listener: (metric: PerformanceMetrics) => void): () => void {
    this.metricListeners.push(listener);

    // Return a function to remove the listener
    return () => {
      const index = this.metricListeners.indexOf(listener);
      if (index !== -1) {
        this.metricListeners.splice(index, 1);
      }
    };
  }

  /**
   * Get metrics for a specific time range
   */
  getMetricsInTimeRange(startTime: number, endTime: number): PerformanceMetrics[] {
    return this.metrics.filter(metric => {
      const metricStartTime = metric.startTime;
      const metricEndTime = metric.endTime || metricStartTime;

      // Check if the metric overlaps with the time range
      return (metricStartTime >= startTime && metricStartTime <= endTime) ||
             (metricEndTime >= startTime && metricEndTime <= endTime) ||
             (metricStartTime <= startTime && metricEndTime >= endTime);
    });
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics for a specific operation
   */
  getMetricsForOperation(name: string): PerformanceMetrics[] {
    return this.metrics.filter((metric) => metric.name === name);
  }

  /**
   * Get average duration for a specific operation
   */
  getAverageDuration(name: string): number | null {
    const metrics = this.getMetricsForOperation(name).filter(
      (metric) => metric.duration !== undefined
    );

    if (metrics.length === 0) {
      return null;
    }

    const totalDuration = metrics.reduce(
      (sum, metric) => sum + (metric.duration || 0),
      0
    );
    return totalDuration / metrics.length;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Create a decorator for measuring method performance
   */
  createMethodDecorator(defaultOptions?: {
    logToConsole?: boolean;
    reportToServer?: boolean;
    includeArgs?: boolean;
  }) {
    const monitor = this;

    return function Measure(name?: string) {
      return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
      ) {
        const originalMethod = descriptor.value;
        const methodName = name || `${target.constructor.name}.${propertyKey}`;
        const options = {
          logToConsole: monitor.logToConsole,
          reportToServer: monitor.reportToServer,
          includeArgs: false,
          ...defaultOptions
        };

        descriptor.value = function (...args: any[]) {
          if (!monitor.isEnabled || Math.random() > monitor.samplingRate) {
            return originalMethod.apply(this, args);
          }

          // Prepare metadata
          const metadata: Record<string, any> = {
            className: target.constructor.name,
            methodName: propertyKey,
          };

          // Include arguments if enabled, but be careful with large objects
          if (options.includeArgs && args.length > 0) {
            try {
              metadata.args = args.map(arg => {
                if (arg === null || arg === undefined) return arg;
                if (typeof arg === 'function') return '[Function]';
                if (typeof arg === 'object') {
                  // For objects, just include the constructor name and a preview
                  const constructor = arg.constructor?.name || 'Object';
                  // Try to get a string representation, but limit its size
                  let preview;
                  try {
                    const str = JSON.stringify(arg);
                    preview = str.length > 100 ? str.substring(0, 97) + '...' : str;
                  } catch (e) {
                    preview = '[Complex Object]';
                  }
                  return `[${constructor}] ${preview}`;
                }
                return arg;
              });
            } catch (e) {
              metadata.args = '[Error serializing args]';
            }
          }

          // Check if method is async
          const isAsync = originalMethod.constructor.name === 'AsyncFunction' ||
                         originalMethod.toString().includes('__awaiter');

          if (isAsync) {
            return monitor.measureAsync(
              methodName,
              () => originalMethod.apply(this, args),
              metadata
            );
          } else {
            return monitor.measure(
              methodName,
              () => originalMethod.apply(this, args),
              metadata
            );
          }
        };

        return descriptor;
      };
    };
  }
}

// Create a singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator for measuring method performance
 */
export const Measure = performanceMonitor.createMethodDecorator();

/**
 * Decorator for measuring method performance with console logging
 */
export const MeasureWithLogging = performanceMonitor.createMethodDecorator({
  logToConsole: true,
  includeArgs: true
});

/**
 * Decorator for measuring method performance with server reporting
 */
export const MeasureWithReporting = performanceMonitor.createMethodDecorator({
  reportToServer: true
});

/**
 * Measure a function's execution time
 */
export function measure<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
  return performanceMonitor.measure(name, fn, metadata);
}

/**
 * Measure an async function's execution time
 */
export async function measureAsync<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
  return performanceMonitor.measureAsync(name, fn, metadata);
}

/**
 * Create a performance-measuring wrapper for a function
 */
export function createMeasuredFunction<T extends (...args: any[]) => any>(
  fn: T,
  name: string,
  options?: { logToConsole?: boolean; reportToServer?: boolean }
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const metadata = { args: args.length > 0 ? args : undefined };
    const result = fn(...args);

    if (result instanceof Promise) {
      return performanceMonitor.measureAsync(
        name,
        async () => result,
        { ...metadata, ...options }
      ) as unknown as ReturnType<T>;
    }

    return performanceMonitor.measure(
      name,
      () => result,
      { ...metadata, ...options }
    ) as ReturnType<T>;
  }) as T;
}

/**
 * Initialize performance monitoring with default configuration
 */
export function initializePerformanceMonitoring(options?: {
  enabled?: boolean;
  logToConsole?: boolean;
  reportToServer?: boolean;
  samplingRate?: number;
  resourceMonitoring?: boolean;
}): void {
  performanceMonitor.configure({
    enabled: options?.enabled ?? true,
    logToConsole: options?.logToConsole ?? (process.env.NODE_ENV === 'development'),
    reportToServer: options?.reportToServer ?? (process.env.NODE_ENV === 'production'),
    samplingRate: options?.samplingRate ?? (process.env.NODE_ENV === 'production' ? 0.1 : 1.0),
    resourceMonitoring: options?.resourceMonitoring ?? (process.env.NODE_ENV === 'production')
  });
}

/**
 * React hook for measuring component render performance
 */
export function usePerformanceMonitoring(componentName: string) {
  // This would be implemented with React hooks
  // For now, we'll just return a simple API
  return {
    markStart: (operationName: string) =>
      performanceMonitor.start(`${componentName}:${operationName}`),
    markEnd: (operationName: string) =>
      performanceMonitor.end(`${componentName}:${operationName}`),
    measure: <T>(operationName: string, fn: () => T, metadata?: Record<string, any>) =>
      performanceMonitor.measure(`${componentName}:${operationName}`, fn, {
        ...metadata,
        component: componentName
      }),
    measureAsync: <T>(operationName: string, fn: () => Promise<T>, metadata?: Record<string, any>) =>
      performanceMonitor.measureAsync(`${componentName}:${operationName}`, fn, {
        ...metadata,
        component: componentName
      }),
  };
}
