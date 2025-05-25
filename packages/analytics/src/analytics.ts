import { AnalyticsConfig, AnalyticsProvider, EventProperties, PageViewProperties, UserProperties } from './types';
import { GoogleAnalyticsProvider } from './providers/googleAnalytics';
import { CustomAnalyticsProvider } from './providers/customAnalytics';
import Cookies from 'js-cookie';

export class Analytics {
  private providers: AnalyticsProvider[] = [];
  private config: AnalyticsConfig | null = null;
  private anonymousId: string | null = null;
  private userId: string | null = null;
  private debug = false;

  constructor() {
    // Generate or retrieve anonymous ID
    this.anonymousId = Cookies.get('fait_anonymous_id') || this.generateAnonymousId();
    Cookies.set('fait_anonymous_id', this.anonymousId, { expires: 365 });
  }

  private generateAnonymousId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  initialize(config: AnalyticsConfig): void {
    this.config = config;
    this.debug = config.debug || false;

    // Initialize Google Analytics if ID is provided
    if (config.googleAnalyticsId) {
      const googleAnalytics = new GoogleAnalyticsProvider();
      googleAnalytics.initialize(config);
      this.providers.push(googleAnalytics);
    }

    // Initialize custom analytics if endpoint is provided
    if (config.customEndpoint) {
      const customAnalytics = new CustomAnalyticsProvider();
      customAnalytics.initialize(config);
      this.providers.push(customAnalytics);
    }

    // Add more providers here as needed

    if (this.debug) {
      console.log('Analytics initialized with providers:', this.providers.length);
    }
  }

  identify(userId: string, userProperties?: UserProperties): void {
    this.userId = userId;
    
    this.providers.forEach(provider => {
      provider.identify(userId, userProperties);
    });
    
    if (this.debug) {
      console.log('Analytics identify:', userId, userProperties);
    }
  }

  track(eventName: string, eventProperties?: EventProperties): void {
    const enrichedProperties = {
      ...eventProperties,
      anonymousId: this.anonymousId,
      userId: this.userId,
      appName: this.config?.appName,
    };
    
    this.providers.forEach(provider => {
      provider.track(eventName, enrichedProperties);
    });
    
    if (this.debug) {
      console.log('Analytics track:', eventName, enrichedProperties);
    }
  }

  page(properties: PageViewProperties): void {
    const enrichedProperties = {
      ...properties,
      anonymousId: this.anonymousId,
      userId: this.userId,
      appName: this.config?.appName,
    };
    
    this.providers.forEach(provider => {
      provider.page(enrichedProperties);
    });
    
    if (this.debug) {
      console.log('Analytics page view:', enrichedProperties);
    }
  }

  reset(): void {
    this.userId = null;
    this.anonymousId = this.generateAnonymousId();
    Cookies.set('fait_anonymous_id', this.anonymousId, { expires: 365 });
    
    this.providers.forEach(provider => {
      provider.reset();
    });
    
    if (this.debug) {
      console.log('Analytics reset');
    }
  }
}
