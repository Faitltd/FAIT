import { useEffect } from 'react';
import * as Sentry from '@sentry/react';

export const PerformanceMonitor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Web Vitals reporting
    if ('web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(metric => reportMetric('CLS', metric));
        getFID(metric => reportMetric('FID', metric));
        getFCP(metric => reportMetric('FCP', metric));
        getLCP(metric => reportMetric('LCP', metric));
        getTTFB(metric => reportMetric('TTFB', metric));
      });
    }

    // Performance Observer for custom metrics
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        Sentry.captureMessage('Performance Entry', {
          level: 'info',
          extra: {
            name: entry.name,
            duration: entry.duration,
            type: entry.entryType,
          },
        });
      });
    });

    observer.observe({ entryTypes: ['resource', 'navigation', 'longtask'] });

    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
};

const reportMetric = (name: string, metric: { value: number }) => {
  Sentry.addBreadcrumb({
    category: 'web-vitals',
    message: `${name}: ${metric.value}`,
    level: 'info',
  });
};