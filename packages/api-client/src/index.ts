export * from './client';
export * from './types';

// Create a default client factory
import { ApiClient, ApiClientConfig } from './client';

export const createApiClient = (config: ApiClientConfig): ApiClient => {
  return new ApiClient(config);
};
