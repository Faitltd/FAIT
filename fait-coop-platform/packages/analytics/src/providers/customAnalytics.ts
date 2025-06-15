import { AnalyticsConfig, AnalyticsProvider, EventProperties, PageViewProperties, UserProperties } from '../types';

export class CustomAnalyticsProvider implements AnalyticsProvider {
  private initialized = false;
  private endpoint: string | null = null;
  private appName: string = '';
  private debug = false;

  initialize(config: AnalyticsConfig): void {
    if (!config.customEndpoint) {
      console.warn('Custom analytics endpoint is not provided. Custom analytics will not be initialized.');
      return;
    }

    this.endpoint = config.customEndpoint;
    this.appName = config.appName;
    this.debug = config.debug || false;
    this.initialized = true;
    
    if (this.debug) {
      console.log('Custom analytics initialized with endpoint:', this.endpoint);
    }
  }

  private async sendEvent(eventType: string, data: any): Promise<void> {
    if (!this.initialized || !this.endpoint) {
      if (this.debug) console.warn('Custom analytics not initialized. Call initialize() first.');
      return;
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          appName: this.appName,
          timestamp: new Date().toISOString(),
          data,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (this.debug) {
        console.log(`Custom analytics ${eventType} sent:`, data);
      }
    } catch (error) {
      if (this.debug) {
        console.error('Error sending custom analytics event:', error);
      }
    }
  }

  identify(userId: string, userProperties?: UserProperties): void {
    this.sendEvent('identify', {
      userId,
      ...userProperties,
    });
  }

  track(eventName: string, eventProperties?: EventProperties): void {
    this.sendEvent('track', {
      eventName,
      ...eventProperties,
    });
  }

  page(properties: PageViewProperties): void {
    this.sendEvent('page', properties);
  }

  reset(): void {
    this.sendEvent('reset', {});
  }
}
