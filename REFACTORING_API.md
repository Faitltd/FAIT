# API Service Refactoring

This document outlines the refactoring of the API service layer in the FAIT Co-op platform.

## Overview

The API service layer has been refactored to improve maintainability, scalability, and code organization. The new system follows the modular architecture pattern and provides a clean, consistent API for data access.

## Key Changes

1. **Modular Architecture**: API service code has been moved to the `src/modules/core/api` directory, following the modular architecture pattern.

2. **Unified API Service**: Created a single, unified API service that can be used throughout the application.

3. **Multiple Client Support**: Added support for different API clients (REST, Supabase) behind a common interface.

4. **Improved Error Handling**: Added consistent error handling for API operations.

5. **Caching Mechanism**: Implemented a caching system for API responses.

6. **Better Type Safety**: Added comprehensive TypeScript types for API-related code.

7. **Base Service Class**: Created a base service class for domain-specific services.

## Directory Structure

```
src/modules/core/api/
  ├── cache/               # API response caching
  │   └── index.ts         # Cache implementation
  ├── clients/             # API client implementations
  │   ├── baseClient.ts    # Base API client
  │   ├── restClient.ts    # REST API client
  │   ├── supabaseClient.ts # Supabase API client
  │   └── index.ts         # Clients barrel file
  ├── services/            # API services
  │   ├── apiService.ts    # Main API service
  │   ├── baseService.ts   # Base service for domain services
  │   └── index.ts         # Services barrel file
  ├── types/               # API type definitions
  │   └── index.ts         # Types definitions
  ├── index.ts             # Module barrel file
  └── README.md            # Module documentation
```

## Usage

### Basic API Usage

```tsx
import { apiService } from '@/modules/core/api';

// Make a GET request
const response = await apiService.get('/endpoint');

// Make a POST request
const response = await apiService.post('/endpoint', { data: 'value' });

// Make a PUT request
const response = await apiService.put('/endpoint', { data: 'value' });

// Make a DELETE request
const response = await apiService.delete('/endpoint');
```

### Using Domain-Specific Services

```tsx
import { BaseService, apiService } from '@/modules/core/api';

// Create a domain-specific service
class UserService extends BaseService {
  constructor() {
    super(apiService, '/users');
  }

  async getUsers() {
    return this.get('');
  }

  async getUser(id: string) {
    return this.get(id);
  }

  async createUser(user: any) {
    return this.post('', user);
  }

  async updateUser(id: string, user: any) {
    return this.put(id, user);
  }

  async deleteUser(id: string) {
    return this.delete(id);
  }
}

// Create and export a singleton instance
export const userService = new UserService();
```

### Using Caching

```tsx
// Get data with caching
const response = await apiService.get('/endpoint', {
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    key: 'custom-cache-key'
  }
});

// Clear cache
apiService.clearCache();

// Clear specific cache entry
apiService.clearCache('custom-cache-key');
```

### Using Interceptors

```tsx
// Add request interceptor
const removeRequestInterceptor = apiService.addRequestInterceptor((config) => {
  // Modify request config
  config.headers = {
    ...config.headers,
    'Authorization': `Bearer ${token}`
  };
  return config;
});

// Add response interceptor
const removeResponseInterceptor = apiService.addResponseInterceptor((response) => {
  // Modify response
  return response;
});

// Add error interceptor
const removeErrorInterceptor = apiService.addErrorInterceptor((error) => {
  // Handle error
  console.error('API Error:', error);
  return error;
});

// Remove interceptors when no longer needed
removeRequestInterceptor();
removeResponseInterceptor();
removeErrorInterceptor();
```

## Migration Guide

To migrate existing code to use the new API service:

1. Replace imports from `./services/apiService` with imports from `@/modules/core/api`.

2. Update API calls to use the new API service.

3. Create domain-specific services that extend the `BaseService` class.

## Example

A complete example of the new API service can be found in the `src/modules/project/services/projectService.ts` file.

## Next Steps

1. Migrate all existing API calls to use the new system.

2. Add comprehensive tests for the API service.

3. Implement additional features like request retries and circuit breaking.

4. Enhance the caching mechanism with more features (e.g., cache invalidation strategies, cache persistence).
