import { AnalyticsConfig, AnalyticsProvider, EventProperties, PageViewProperties, UserProperties } from '../types';

export class GoogleAnalyticsProvider implements AnalyticsProvider {
  private initialized = false;
  private debug = false;

  initialize(config: AnalyticsConfig): void {
    if (!config.googleAnalyticsId) {
      console.warn('Google Analytics ID is not provided. Google Analytics will not be initialized.');
      return;
    }

    this.debug = config.debug || false;

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`;
    document.head.appendChild(script);

    // Initialize Google Analytics
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', config.googleAnalyticsId);

    this.initialized = true;
    
    if (this.debug) {
      console.log('Google Analytics initialized with ID:', config.googleAnalyticsId);
    }
  }

  identify(userId: string, userProperties?: UserProperties): void {
    if (!this.initialized) {
      if (this.debug) console.warn('Google Analytics not initialized. Call initialize() first.');
      return;
    }

    window.gtag('set', 'user_properties', {
      user_id: userId,
      ...userProperties,
    });
    
    if (this.debug) {
      console.log('Google Analytics identify:', userId, userProperties);
    }
  }

  track(eventName: string, eventProperties?: EventProperties): void {
    if (!this.initialized) {
      if (this.debug) console.warn('Google Analytics not initialized. Call initialize() first.');
      return;
    }

    window.gtag('event', eventName, eventProperties);
    
    if (this.debug) {
      console.log('Google Analytics track:', eventName, eventProperties);
    }
  }

  page(properties: PageViewProperties): void {
    if (!this.initialized) {
      if (this.debug) console.warn('Google Analytics not initialized. Call initialize() first.');
      return;
    }

    window.gtag('event', 'page_view', {
      page_path: properties.path,
      page_title: properties.title,
      page_location: window.location.href,
      ...properties,
    });
    
    if (this.debug) {
      console.log('Google Analytics page view:', properties);
    }
  }

  reset(): void {
    if (!this.initialized) {
      if (this.debug) console.warn('Google Analytics not initialized. Call initialize() first.');
      return;
    }

    // Google Analytics doesn't have a direct reset method
    // We can set a new client ID to effectively reset the user
    window.gtag('config', window.GA_MEASUREMENT_ID, {
      client_id: Math.random().toString(36).substring(2),
    });
    
    if (this.debug) {
      console.log('Google Analytics reset');
    }
  }
}

// Add type definitions for window object
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    GA_MEASUREMENT_ID?: string;
  }
}
