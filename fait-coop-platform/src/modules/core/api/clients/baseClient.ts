/**
 * Base API Client
 * 
 * This file implements a base API client with common functionality.
 */

import {
  ApiClient,
  ApiRequestConfig,
  ApiResponse,
  ApiError,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor
} from '../types';
import apiCache from '../cache';

/**
 * Base API client implementation
 */
export abstract class BaseApiClient implements ApiClient {
  protected baseURL: string;
  protected defaultHeaders: Record<string, string>;
  protected requestInterceptors: RequestInterceptor[] = [];
  protected responseInterceptors: ResponseInterceptor[] = [];
  protected errorInterceptors: ErrorInterceptor[] = [];

  /**
   * Constructor
   * @param baseURL Base URL for API requests
   * @param defaultHeaders Default headers for all requests
   */
  constructor(baseURL: string = '', defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
  }

  /**
   * Add a request interceptor
   * @param interceptor Request interceptor function
   * @returns Function to remove the interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      this.requestInterceptors = this.requestInterceptors.filter(i => i !== interceptor);
    };
  }

  /**
   * Add a response interceptor
   * @param interceptor Response interceptor function
   * @returns Function to remove the interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      this.responseInterceptors = this.responseInterceptors.filter(i => i !== interceptor);
    };
  }

  /**
   * Add an error interceptor
   * @param interceptor Error interceptor function
   * @returns Function to remove the interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      this.errorInterceptors = this.errorInterceptors.filter(i => i !== interceptor);
    };
  }

  /**
   * Apply request interceptors
   * @param config Request configuration
   * @returns Modified request configuration
   */
  protected async applyRequestInterceptors(config: ApiRequestConfig): Promise<ApiRequestConfig> {
    let modifiedConfig = { ...config };
    
    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }
    
    return modifiedConfig;
  }

  /**
   * Apply response interceptors
   * @param response API response
   * @returns Modified API response
   */
  protected async applyResponseInterceptors<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    let modifiedResponse = { ...response };
    
    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }
    
    return modifiedResponse;
  }

  /**
   * Apply error interceptors
   * @param error API error
   * @returns Modified API error
   */
  protected async applyErrorInterceptors(error: ApiError): Promise<ApiError> {
    let modifiedError = { ...error };
    
    for (const interceptor of this.errorInterceptors) {
      modifiedError = await interceptor(modifiedError);
    }
    
    return modifiedError;
  }

  /**
   * Generate cache key for a request
   * @param config Request configuration
   * @returns Cache key
   */
  protected generateCacheKey(config: ApiRequestConfig): string {
    const { method = 'GET', url = '', params = {}, data } = config;
    
    // Custom cache key if provided
    if (config.cache?.key) {
      return config.cache.key;
    }
    
    // Generate key based on method, URL, params, and data
    const paramsString = params ? JSON.stringify(params) : '';
    const dataString = data ? JSON.stringify(data) : '';
    
    return `${method}:${url}:${paramsString}:${dataString}`;
  }

  /**
   * Check if response should be cached
   * @param config Request configuration
   * @returns True if response should be cached
   */
  protected shouldCache(config: ApiRequestConfig): boolean {
    // Only cache GET requests by default
    if (config.method !== 'GET' && config.method !== undefined) {
      return false;
    }
    
    // Check if caching is explicitly enabled/disabled
    return config.cache?.enabled !== false;
  }

  /**
   * Get cache TTL for a request
   * @param config Request configuration
   * @returns Cache TTL in milliseconds
   */
  protected getCacheTTL(config: ApiRequestConfig): number {
    // Default TTL is 5 minutes
    return config.cache?.ttl || 5 * 60 * 1000;
  }

  /**
   * Make an API request
   * @param config Request configuration
   * @returns API response
   */
  abstract request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>>;

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
}
