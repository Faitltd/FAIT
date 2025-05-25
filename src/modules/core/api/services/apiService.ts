/**
 * API Service
 * 
 * This file implements the main API service that combines all clients.
 */

import {
  ApiService as ApiServiceInterface,
  ApiRequestConfig,
  ApiResponse,
  ApiError,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  ApiCacheConfig,
  ApiRetryConfig,
  ApiCircuitBreakerConfig
} from '../types';
import { RestApiClient, SupabaseApiClient } from '../clients';
import apiCache from '../cache';

/**
 * API service implementation
 */
export class ApiService implements ApiServiceInterface {
  private restClient: RestApiClient;
  private supabaseClient: SupabaseApiClient;
  private defaultCacheConfig: Partial<ApiCacheConfig> = {
    enabled: true,
    ttl: 5 * 60 * 1000 // 5 minutes
  };
  private defaultRetryConfig: Partial<ApiRetryConfig> = {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000
  };
  private defaultCircuitBreakerConfig: Partial<ApiCircuitBreakerConfig> = {
    enabled: true,
    failureThreshold: 5,
    resetTimeout: 30000
  };

  /**
   * Constructor
   * @param restBaseUrl Base URL for REST API
   * @param defaultHeaders Default headers for all requests
   */
  constructor(restBaseUrl: string = '', defaultHeaders: Record<string, string> = {}) {
    this.restClient = new RestApiClient(restBaseUrl, defaultHeaders);
    this.supabaseClient = new SupabaseApiClient();
  }

  /**
   * Add a request interceptor
   * @param interceptor Request interceptor function
   * @returns Function to remove the interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    const removeRest = this.restClient.addRequestInterceptor(interceptor);
    const removeSupabase = this.supabaseClient.addRequestInterceptor(interceptor);
    
    return () => {
      removeRest();
      removeSupabase();
    };
  }

  /**
   * Add a response interceptor
   * @param interceptor Response interceptor function
   * @returns Function to remove the interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    const removeRest = this.restClient.addResponseInterceptor(interceptor);
    const removeSupabase = this.supabaseClient.addResponseInterceptor(interceptor);
    
    return () => {
      removeRest();
      removeSupabase();
    };
  }

  /**
   * Add an error interceptor
   * @param interceptor Error interceptor function
   * @returns Function to remove the interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    const removeRest = this.restClient.addErrorInterceptor(interceptor);
    const removeSupabase = this.supabaseClient.addErrorInterceptor(interceptor);
    
    return () => {
      removeRest();
      removeSupabase();
    };
  }

  /**
   * Configure cache settings
   * @param config Cache configuration
   */
  configureCache(config: Partial<ApiCacheConfig>): void {
    this.defaultCacheConfig = {
      ...this.defaultCacheConfig,
      ...config
    };
    
    // Configure cache TTL
    if (config.ttl) {
      apiCache.configure(config.ttl);
    }
  }

  /**
   * Configure retry settings
   * @param config Retry configuration
   */
  configureRetry(config: Partial<ApiRetryConfig>): void {
    this.defaultRetryConfig = {
      ...this.defaultRetryConfig,
      ...config
    };
  }

  /**
   * Configure circuit breaker settings
   * @param config Circuit breaker configuration
   */
  configureCircuitBreaker(config: Partial<ApiCircuitBreakerConfig>): void {
    this.defaultCircuitBreakerConfig = {
      ...this.defaultCircuitBreakerConfig,
      ...config
    };
  }

  /**
   * Clear cache
   * @param key Cache key (optional, clears all cache if not provided)
   */
  clearCache(key?: string): void {
    if (key) {
      apiCache.delete(key);
    } else {
      apiCache.clear();
    }
  }

  /**
   * Make an API request
   * @param config Request configuration
   * @returns API response
   */
  async request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    // Apply default configurations
    const mergedConfig: ApiRequestConfig = {
      ...config,
      cache: {
        ...this.defaultCacheConfig,
        ...config.cache
      },
      retry: {
        ...this.defaultRetryConfig,
        ...config.retry
      }
    };
    
    // Determine which client to use
    if (this.isSupabaseRequest(mergedConfig)) {
      return this.supabaseClient.request<T>(mergedConfig);
    } else {
      return this.restClient.request<T>(mergedConfig);
    }
  }

  /**
   * Make a GET request
   * @param url Request URL
   * @param config Request configuration
   * @returns API response
   */
  async get<T = any>(url: string, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...config,
      method: 'GET',
      url
    });
  }

  /**
   * Make a POST request
   * @param url Request URL
   * @param data Request data
   * @param config Request configuration
   * @returns API response
   */
  async post<T = any>(url: string, data?: any, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...config,
      method: 'POST',
      url,
      data
    });
  }

  /**
   * Make a PUT request
   * @param url Request URL
   * @param data Request data
   * @param config Request configuration
   * @returns API response
   */
  async put<T = any>(url: string, data?: any, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...config,
      method: 'PUT',
      url,
      data
    });
  }

  /**
   * Make a PATCH request
   * @param url Request URL
   * @param data Request data
   * @param config Request configuration
   * @returns API response
   */
  async patch<T = any>(url: string, data?: any, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...config,
      method: 'PATCH',
      url,
      data
    });
  }

  /**
   * Make a DELETE request
   * @param url Request URL
   * @param config Request configuration
   * @returns API response
   */
  async delete<T = any>(url: string, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>({
      ...config,
      method: 'DELETE',
      url
    });
  }

  /**
   * Check if a request should use the Supabase client
   * @param config Request configuration
   * @returns True if the request should use the Supabase client
   */
  private isSupabaseRequest(config: ApiRequestConfig): boolean {
    // Check if explicitly specified
    if (config.headers?.['x-client'] === 'supabase') {
      return true;
    }
    
    // Check URL pattern
    const url = config.url || '';
    
    // URLs that don't start with / or http are considered Supabase table names
    if (!url.startsWith('/') && !url.startsWith('http')) {
      return true;
    }
    
    return false;
  }
}
