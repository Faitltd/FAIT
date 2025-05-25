export interface AnalyticsConfig {
  appName: string;
  debug?: boolean;
  googleAnalyticsId?: string;
  mixpanelToken?: string;
  amplitudeApiKey?: string;
  segmentWriteKey?: string;
  customEndpoint?: string;
}

export interface EventProperties {
  [key: string]: any;
}

export interface UserProperties {
  id?: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

export interface PageViewProperties {
  path: string;
  title?: string;
  referrer?: string;
  [key: string]: any;
}

export interface AnalyticsProvider {
  initialize(config: AnalyticsConfig): void;
  identify(userId: string, userProperties?: UserProperties): void;
  track(eventName: string, eventProperties?: EventProperties): void;
  page(properties: PageViewProperties): void;
  reset(): void;
}
