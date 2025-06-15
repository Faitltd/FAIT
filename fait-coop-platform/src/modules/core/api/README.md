# API Module

This module provides a unified API service layer for the FAIT Co-op platform. It handles API requests, caching, error handling, and data transformation.

## Features

- Unified API client
- Request/response interceptors
- Automatic error handling
- Response caching
- Request retries and circuit breaking
- Type-safe API responses

## Directory Structure

```
/api
  /clients          # API client implementations
  /interceptors     # Request/response interceptors
  /cache            # Caching mechanisms
  /types            # API type definitions
  /utils            # API utility functions
  /services         # Base service classes
  index.ts          # Public API exports
```

## Usage

Import and use the API services:

```tsx
import { useEffect, useState } from 'react';
import { apiService } from '@/modules/core/api';

function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await apiService.get('/endpoint');
        setData(result.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* Render data */}</div>;
}
```

## API Clients

The module supports multiple API clients:

1. **Supabase Client**: For Supabase database operations
2. **REST Client**: For standard REST API calls
3. **GraphQL Client**: For GraphQL API calls

Each client implements the same interface, making them interchangeable.

## Caching

API responses can be cached to improve performance:

```tsx
// Get data with caching
const data = await apiService.get('/endpoint', {
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    key: 'custom-cache-key'
  }
});
```

## Error Handling

The API module provides consistent error handling:

```tsx
try {
  const data = await apiService.get('/endpoint');
} catch (error) {
  if (error.status === 401) {
    // Handle unauthorized error
  } else if (error.status === 404) {
    // Handle not found error
  } else {
    // Handle other errors
  }
}
```

## Interceptors

You can add request and response interceptors:

```tsx
// Add authentication token to all requests
apiService.addRequestInterceptor((config) => {
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Transform response data
apiService.addResponseInterceptor((response) => {
  return {
    ...response,
    data: transformData(response.data)
  };
});
```

## Circuit Breaking

The API module includes circuit breaking to prevent cascading failures:

```tsx
// Configure circuit breaker
apiService.configureCircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000,
  fallback: () => ({ data: defaultData })
});
```
