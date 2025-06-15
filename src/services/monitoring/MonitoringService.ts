import * as Sentry from '@sentry/react';
import { Logger } from '../logging/Logger';
import { MetricsService } from './MetricsService';

export class MonitoringService {
  private static instance: MonitoringService;
  private logger: Logger;
  private metrics: MetricsService;

  private constructor() {
    this.logger = new Logger('MonitoringService');
    this.metrics = new MetricsService();
    this.setupErrorHandling();
    this.setupPerformanceMonitoring();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private setupErrorHandling(): void {
    window.addEventListener('unhandledrejection', (event) => {
      this.logger.error('Unhandled Promise Rejection:', event.reason);
      Sentry.captureException(event.reason);
    });

    window.addEventListener('error', (event) => {
      this.logger.error('Uncaught Error:', event.error);
      Sentry.captureException(event.error);
    });
  }

  private setupPerformanceMonitoring(): void {
    // Monitor route changes
    const navigationObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.metrics.recordNavigation(entry);
      }
    });
    navigationObserver.observe({ entryTypes: ['navigation'] });

    // Monitor long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Tasks longer than 50ms
          this.metrics.recordLongTask(entry);
        }
      }
    });
    longTaskObserver.observe({ entryTypes: ['longtask'] });
  }

  public recordError(error: Error, context?: object): void {
    this.logger.error(error.message, { error, context });
    Sentry.captureException(error, { extra: context });
  }

  public recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    this.metrics.record(name, value, tags);
  }
}