/**
 * Performance monitoring utilities
 */

// Store performance metrics
const metrics = {
  marks: {},
  measures: {},
  resources: [],
  interactions: [],
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  // Check if Performance API is available
  if (!window.performance) {
    console.warn('Performance API is not supported in this browser');
    return;
  }
  
  // Track page load metrics
  trackPageLoad();
  
  // Set up resource timing buffer
  if (performance.setResourceTimingBufferSize) {
    performance.setResourceTimingBufferSize(300);
  }
  
  // Listen for resource timing buffer full
  if (performance.onresourcetimingbufferfull) {
    performance.onresourcetimingbufferfull = () => {
      const entries = performance.getEntriesByType('resource');
      metrics.resources = metrics.resources.concat(entries);
      performance.clearResourceTimings();
    };
  }
  
  // Set up observer for long tasks
  if ('PerformanceObserver' in window) {
    try {
      // Observe long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          console.warn(`Long task detected: ${entry.duration}ms`, entry);
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      
      // Observe resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        metrics.resources = metrics.resources.concat(entries);
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      
      // Observe paint timing
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          metrics[entry.name] = entry.startTime;
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      
      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.largestContentfulPaint = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Observe first input delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          metrics.firstInputDelay = entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      
      // Observe layout shifts
      const clsObserver = new PerformanceObserver((list) => {
        let cumulativeLayoutShift = 0;
        list.getEntries().forEach(entry => {
          if (!entry.hadRecentInput) {
            cumulativeLayoutShift += entry.value;
          }
        });
        metrics.cumulativeLayoutShift = cumulativeLayoutShift;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      
    } catch (e) {
      console.warn('PerformanceObserver error:', e);
    }
  }
};

// Track page load metrics
const trackPageLoad = () => {
  // Wait for load event to capture all metrics
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navEntry = performance.getEntriesByType('navigation')[0];
      
      if (navEntry) {
        metrics.pageLoad = {
          dnsLookup: navEntry.domainLookupEnd - navEntry.domainLookupStart,
          tcpConnection: navEntry.connectEnd - navEntry.connectStart,
          requestStart: navEntry.requestStart,
          responseStart: navEntry.responseStart,
          responseEnd: navEntry.responseEnd,
          domInteractive: navEntry.domInteractive,
          domContentLoaded: navEntry.domContentLoadedEventEnd,
          domComplete: navEntry.domComplete,
          loadEvent: navEntry.loadEventEnd,
          totalTime: navEntry.loadEventEnd - navEntry.startTime,
        };
      }
    }, 0);
  });
};

/**
 * Mark the start of a performance measurement
 * 
 * @param {string} name - Name of the mark
 */
export const markStart = (name) => {
  if (!window.performance) return;
  
  const markName = `${name}_start`;
  performance.mark(markName);
  metrics.marks[markName] = performance.now();
};

/**
 * Mark the end of a performance measurement and record the measure
 * 
 * @param {string} name - Name of the mark
 */
export const markEnd = (name) => {
  if (!window.performance) return;
  
  const startMark = `${name}_start`;
  const endMark = `${name}_end`;
  
  performance.mark(endMark);
  metrics.marks[endMark] = performance.now();
  
  try {
    performance.measure(name, startMark, endMark);
    const entries = performance.getEntriesByName(name, 'measure');
    if (entries.length > 0) {
      metrics.measures[name] = entries[0].duration;
    }
  } catch (e) {
    console.warn(`Error measuring ${name}:`, e);
  }
};

/**
 * Track a user interaction
 * 
 * @param {string} name - Name of the interaction
 * @param {Function} fn - Function to execute and measure
 * @returns {Function} - Wrapped function that tracks performance
 */
export const trackInteraction = (name, fn) => {
  return (...args) => {
    markStart(`interaction_${name}`);
    const result = fn(...args);
    
    // Handle promises
    if (result instanceof Promise) {
      return result.finally(() => {
        markEnd(`interaction_${name}`);
      });
    }
    
    markEnd(`interaction_${name}`);
    return result;
  };
};

/**
 * Get all performance metrics
 * 
 * @returns {Object} - Performance metrics
 */
export const getPerformanceMetrics = () => {
  return { ...metrics };
};

/**
 * Report performance metrics to a backend service
 * 
 * @param {string} endpoint - API endpoint for reporting
 * @returns {Promise} - Promise that resolves when reporting is complete
 */
export const reportPerformanceMetrics = async (endpoint = '/api/performance') => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metrics: getPerformanceMetrics(),
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      }),
    });
    
    return response.ok;
  } catch (e) {
    console.error('Failed to report performance metrics:', e);
    return false;
  }
};
