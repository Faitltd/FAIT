import { Analytics } from './analytics';
import { AnalyticsConfig } from './types';

// Create a singleton instance
const analytics = new Analytics();

// Export the singleton instance
export { analytics };

// Export types
export * from './types';

// Export a function to initialize analytics
export const initializeAnalytics = (config: AnalyticsConfig): void => {
  analytics.initialize(config);
};
