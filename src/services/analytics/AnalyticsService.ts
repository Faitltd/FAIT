import { Logger } from '../logging/Logger';

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private logger: Logger;
  private sessionId: string;
  private queue: AnalyticsEvent[] = [];
  private isProcessing: boolean = false;

  private constructor() {
    this.logger = new Logger('AnalyticsService');
    this.sessionId = this.generateSessionId();
    this.setupQueueProcessor();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public trackEvent(category: string, action: string, label?: string, value?: number): void {
    const event: AnalyticsEvent = {
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      userId: this.getUserId(),
      sessionId: this.sessionId,
    };

    this.queue.push(event);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    try {
      const batch = this.queue.splice(0, 20); // Process 20 events at a time
      await this.sendEvents(batch);
    } catch (error) {
      this.logger.error('Failed to process analytics queue:', error);
      // Put failed events back in queue
      this.queue.unshift(...this.queue);
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }

  private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
    try {
      const response = await fetch(`${environment.apiUrl}/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.statusText}`);
      }
    } catch (error) {
      this.logger.error('Failed to send analytics events:', error);
      throw error;
    }
  }

  private getUserId(): string | undefined {
    // Implement your user ID retrieval logic here
    return localStorage.getItem('userId') || undefined;
  }

  private setupQueueProcessor(): void {
    // Process queue before page unload
    window.addEventListener('beforeunload', () => {
      if (this.queue.length > 0) {
        navigator.sendBeacon(
          `${environment.apiUrl}/analytics/events`,
          JSON.stringify({ events: this.queue })
        );
      }
    });
  }
}