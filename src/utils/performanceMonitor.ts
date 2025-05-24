/**
 * Performance monitoring utility for tracking and reporting performance metrics
 */

// Types for performance metrics
export interface PerformanceMetrics {
  // Navigation timing metrics
  navigationStart?: number;
  loadTime?: number;
  domContentLoaded?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  timeToInteractive?: number;
  
  // Custom metrics
  componentRenderTime?: Record<string, number>;
  apiCallTime?: Record<string, number>;
  resourceLoadTime?: Record<string, number>;
  customMetrics?: Record<string, number>;
}

// Performance monitoring configuration
export interface PerformanceMonitorConfig {
  enableConsoleLogging?: boolean;
  enableReporting?: boolean;
  reportingEndpoint?: string;
  samplingRate?: number;
  includeNavigationTiming?: boolean;
  includeResourceTiming?: boolean;
  includeUserTiming?: boolean;
  includePaintTiming?: boolean;
  includeLayoutShift?: boolean;
  includeFirstInput?: boolean;
  includeMemory?: boolean;
  includeNetworkInformation?: boolean;
  includeDeviceInformation?: boolean;
  customMetrics?: string[];
}

// Default configuration
const defaultConfig: PerformanceMonitorConfig = {
  enableConsoleLogging: false,
  enableReporting: false,
  reportingEndpoint: '/api/performance',
  samplingRate: 0.1, // 10% of users
  includeNavigationTiming: true,
  includeResourceTiming: true,
  includeUserTiming: true,
  includePaintTiming: true,
  includeLayoutShift: true,
  includeFirstInput: true,
  includeMemory: true,
  includeNetworkInformation: true,
  includeDeviceInformation: true,
  customMetrics: [],
};

class PerformanceMonitor {
  private config: PerformanceMonitorConfig;
  private metrics: PerformanceMetrics = {};
  private marksAndMeasures: Record<string, number> = {};
  private isInitialized = false;
  private isMobile: boolean;
  private observers: any[] = [];

  constructor(config: Partial<PerformanceMonitorConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.isMobile = this.detectMobile();
    
    // Only initialize if performance API is available
    if (typeof window !== 'undefined' && 'performance' in window) {
      this.initialize();
    }
  }

  /**
   * Initialize performance monitoring
   */
  private initialize(): void {
    if (this.isInitialized) return;
    
    // Check if we should collect metrics based on sampling rate
    if (Math.random() > this.config.samplingRate) return;
    
    this.collectNavigationTiming();
    this.observePaintTiming();
    this.observeLayoutShift();
    this.observeFirstInput();
    
    // Listen for window load event to collect metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.collectMetrics();
        if (this.config.enableConsoleLogging) {
          this.logMetrics();
        }
        if (this.config.enableReporting) {
          this.reportMetrics();
        }
      }, 1000); // Wait for 1 second after load to collect metrics
    });
    
    this.isInitialized = true;
  }

  /**
   * Detect if the user is on a mobile device
   */
  private detectMobile(): boolean {
    if (typeof navigator === 'undefined') return false;
    
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Collect navigation timing metrics
   */
  private collectNavigationTiming(): void {
    if (!this.config.includeNavigationTiming) return;
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return;
    
    this.metrics.navigationStart = navigation.startTime;
    this.metrics.loadTime = navigation.loadEventEnd - navigation.startTime;
    this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.startTime;
  }

  /**
   * Observe paint timing metrics
   */
  private observePaintTiming(): void {
    if (!this.config.includePaintTiming || !('PerformanceObserver' in window)) return;
    
    try {
      // First Paint and First Contentful Paint
      const paintObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          const metricName = entry.name === 'first-paint' ? 'firstPaint' : 'firstContentfulPaint';
          this.metrics[metricName] = entry.startTime;
        });
      });
      
      paintObserver.observe({ type: 'paint', buffered: true });
      this.observers.push(paintObserver);
      
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.metrics.largestContentfulPaint = lastEntry.startTime;
        }
      });
      
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(lcpObserver);
    } catch (e) {
      console.error('Error observing paint timing:', e);
    }
  }

  /**
   * Observe layout shift metrics
   */
  private observeLayoutShift(): void {
    if (!this.config.includeLayoutShift || !('PerformanceObserver' in window)) return;
    
    try {
      let cumulativeLayoutShift = 0;
      
      const layoutShiftObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // Only count layout shifts without recent user input
          if (!(entry as any).hadRecentInput) {
            cumulativeLayoutShift += (entry as any).value;
          }
        }
        
        this.metrics.cumulativeLayoutShift = cumulativeLayoutShift;
      });
      
      layoutShiftObserver.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(layoutShiftObserver);
    } catch (e) {
      console.error('Error observing layout shift:', e);
    }
  }

  /**
   * Observe first input delay
   */
  private observeFirstInput(): void {
    if (!this.config.includeFirstInput || !('PerformanceObserver' in window)) return;
    
    try {
      const firstInputObserver = new PerformanceObserver((entryList) => {
        const firstInput = entryList.getEntries()[0];
        if (firstInput) {
          this.metrics.firstInputDelay = firstInput.processingStart - firstInput.startTime;
        }
      });
      
      firstInputObserver.observe({ type: 'first-input', buffered: true });
      this.observers.push(firstInputObserver);
    } catch (e) {
      console.error('Error observing first input delay:', e);
    }
  }

  /**
   * Mark the start of a custom performance measurement
   */
  public markStart(markName: string): void {
    if (!this.isInitialized) return;
    
    const markFullName = `${markName}_start`;
    performance.mark(markFullName);
    this.marksAndMeasures[markFullName] = performance.now();
  }

  /**
   * Mark the end of a custom performance measurement and record the duration
   */
  public markEnd(markName: string): number {
    if (!this.isInitialized) return 0;
    
    const startMarkName = `${markName}_start`;
    const endMarkName = `${markName}_end`;
    
    if (!this.marksAndMeasures[startMarkName]) {
      console.warn(`No start mark found for ${markName}`);
      return 0;
    }
    
    performance.mark(endMarkName);
    
    const startTime = this.marksAndMeasures[startMarkName];
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Create a measure
    try {
      performance.measure(markName, startMarkName, endMarkName);
    } catch (e) {
      console.error(`Error creating measure for ${markName}:`, e);
    }
    
    // Store the custom metric
    if (!this.metrics.customMetrics) {
      this.metrics.customMetrics = {};
    }
    
    this.metrics.customMetrics[markName] = duration;
    
    return duration;
  }

  /**
   * Track component render time
   */
  public trackComponentRender(componentName: string, renderTime: number): void {
    if (!this.isInitialized) return;
    
    if (!this.metrics.componentRenderTime) {
      this.metrics.componentRenderTime = {};
    }
    
    this.metrics.componentRenderTime[componentName] = renderTime;
  }

  /**
   * Track API call time
   */
  public trackApiCall(apiName: string, duration: number): void {
    if (!this.isInitialized) return;
    
    if (!this.metrics.apiCallTime) {
      this.metrics.apiCallTime = {};
    }
    
    this.metrics.apiCallTime[apiName] = duration;
  }

  /**
   * Collect all metrics
   */
  private collectMetrics(): void {
    // Collect resource timing if enabled
    if (this.config.includeResourceTiming) {
      this.collectResourceTiming();
    }
    
    // Collect user timing if enabled
    if (this.config.includeUserTiming) {
      this.collectUserTiming();
    }
    
    // Collect memory info if enabled
    if (this.config.includeMemory) {
      this.collectMemoryInfo();
    }
    
    // Collect network information if enabled
    if (this.config.includeNetworkInformation) {
      this.collectNetworkInfo();
    }
    
    // Collect device information if enabled
    if (this.config.includeDeviceInformation) {
      this.collectDeviceInfo();
    }
  }

  /**
   * Collect resource timing metrics
   */
  private collectResourceTiming(): void {
    const resources = performance.getEntriesByType('resource');
    
    if (!this.metrics.resourceLoadTime) {
      this.metrics.resourceLoadTime = {};
    }
    
    resources.forEach((resource) => {
      const url = new URL(resource.name);
      const pathname = url.pathname;
      const fileType = pathname.split('.').pop() || 'unknown';
      
      if (!this.metrics.resourceLoadTime![fileType]) {
        this.metrics.resourceLoadTime![fileType] = 0;
      }
      
      this.metrics.resourceLoadTime![fileType] += resource.duration;
    });
  }

  /**
   * Collect user timing metrics
   */
  private collectUserTiming(): void {
    const marks = performance.getEntriesByType('mark');
    const measures = performance.getEntriesByType('measure');
    
    if (!this.metrics.customMetrics) {
      this.metrics.customMetrics = {};
    }
    
    measures.forEach((measure) => {
      this.metrics.customMetrics![measure.name] = measure.duration;
    });
  }

  /**
   * Collect memory information
   */
  private collectMemoryInfo(): void {
    if (!this.metrics.customMetrics) {
      this.metrics.customMetrics = {};
    }
    
    // Check if memory info is available (Chrome only)
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      this.metrics.customMetrics['jsHeapSizeLimit'] = memory.jsHeapSizeLimit;
      this.metrics.customMetrics['totalJSHeapSize'] = memory.totalJSHeapSize;
      this.metrics.customMetrics['usedJSHeapSize'] = memory.usedJSHeapSize;
    }
  }

  /**
   * Collect network information
   */
  private collectNetworkInfo(): void {
    if (!this.metrics.customMetrics) {
      this.metrics.customMetrics = {};
    }
    
    // Check if Network Information API is available
    if (navigator.connection) {
      const connection = navigator.connection as any;
      this.metrics.customMetrics['effectiveType'] = connection.effectiveType;
      this.metrics.customMetrics['downlink'] = connection.downlink;
      this.metrics.customMetrics['rtt'] = connection.rtt;
      this.metrics.customMetrics['saveData'] = connection.saveData;
    }
  }

  /**
   * Collect device information
   */
  private collectDeviceInfo(): void {
    if (!this.metrics.customMetrics) {
      this.metrics.customMetrics = {};
    }
    
    this.metrics.customMetrics['userAgent'] = navigator.userAgent;
    this.metrics.customMetrics['deviceMemory'] = (navigator as any).deviceMemory;
    this.metrics.customMetrics['hardwareConcurrency'] = navigator.hardwareConcurrency;
    this.metrics.customMetrics['isMobile'] = this.isMobile;
  }

  /**
   * Log metrics to console
   */
  public logMetrics(): void {
    console.group('Performance Metrics');
    console.log('Navigation Timing:', {
      loadTime: this.formatTime(this.metrics.loadTime),
      domContentLoaded: this.formatTime(this.metrics.domContentLoaded),
    });
    console.log('Paint Timing:', {
      firstPaint: this.formatTime(this.metrics.firstPaint),
      firstContentfulPaint: this.formatTime(this.metrics.firstContentfulPaint),
      largestContentfulPaint: this.formatTime(this.metrics.largestContentfulPaint),
    });
    console.log('Interaction:', {
      firstInputDelay: this.formatTime(this.metrics.firstInputDelay),
      cumulativeLayoutShift: this.metrics.cumulativeLayoutShift?.toFixed(3),
    });
    console.log('Custom Metrics:', this.metrics.customMetrics);
    console.log('Component Render Time:', this.metrics.componentRenderTime);
    console.log('API Call Time:', this.metrics.apiCallTime);
    console.log('Resource Load Time:', this.metrics.resourceLoadTime);
    console.groupEnd();
  }

  /**
   * Format time in milliseconds to a readable string
   */
  private formatTime(time?: number): string {
    if (time === undefined) return 'N/A';
    return `${time.toFixed(2)}ms`;
  }

  /**
   * Report metrics to the server
   */
  private reportMetrics(): void {
    if (!this.config.reportingEndpoint) return;
    
    const payload = {
      metrics: this.metrics,
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      isMobile: this.isMobile,
    };
    
    // Use sendBeacon if available, otherwise fall back to fetch
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        this.config.reportingEndpoint,
        JSON.stringify(payload)
      );
    } else {
      fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        // Use keepalive to ensure the request completes even if the page is unloaded
        keepalive: true,
      }).catch((error) => {
        console.error('Error reporting performance metrics:', error);
      });
    }
  }

  /**
   * Clean up observers and marks
   */
  public cleanup(): void {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    
    this.observers = [];
    performance.clearMarks();
    performance.clearMeasures();
  }
}

// Create a singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
