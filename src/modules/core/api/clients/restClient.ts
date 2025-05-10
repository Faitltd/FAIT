/**
 * REST API Client
 * 
 * This file implements a REST API client using the Fetch API.
 */

import { BaseApiClient } from './baseClient';
import {
  ApiRequestConfig,
  ApiResponse,
  ApiError,
  HttpMethod
} from '../types';
import apiCache from '../cache';

/**
 * REST API client implementation
 */
export class RestApiClient extends BaseApiClient {
  /**
   * Make an API request
   * @param config Request configuration
   * @returns API response
   */
  async request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    try {
      // Apply request interceptors
      const modifiedConfig = await this.applyRequestInterceptors(config);
      
      // Check cache if applicable
      if (this.shouldCache(modifiedConfig)) {
        const cacheKey = this.generateCacheKey(modifiedConfig);
        
        // Return cached response if available and not invalidated
        if (!modifiedConfig.cache?.invalidate) {
          const cachedResponse = apiCache.get<ApiResponse<T>>(cacheKey);
          
          if (cachedResponse) {
            return {
              ...cachedResponse,
              cached: true
            };
          }
        }
      }
      
      // Prepare fetch options
      const fetchOptions = this.prepareFetchOptions(modifiedConfig);
      
      // Prepare URL with query parameters
      const url = this.prepareUrl(modifiedConfig.url || '', modifiedConfig.params);
      
      // Make the request
      const response = await this.fetchWithTimeout(url, fetchOptions, modifiedConfig.timeout);
      
      // Parse response
      const apiResponse = await this.parseResponse<T>(response, modifiedConfig);
      
      // Apply response interceptors
      const modifiedResponse = await this.applyResponseInterceptors(apiResponse);
      
      // Cache response if applicable
      if (this.shouldCache(modifiedConfig)) {
        const cacheKey = this.generateCacheKey(modifiedConfig);
        const cacheTTL = this.getCacheTTL(modifiedConfig);
        
        apiCache.set(cacheKey, modifiedResponse, cacheTTL);
      }
      
      return modifiedResponse;
    } catch (error) {
      // Handle and transform error
      const apiError = this.handleError(error, config);
      
      // Apply error interceptors
      const modifiedError = await this.applyErrorInterceptors(apiError);
      
      throw modifiedError;
    }
  }

  /**
   * Prepare fetch options from request config
   * @param config Request configuration
   * @returns Fetch options
   */
  private prepareFetchOptions(config: ApiRequestConfig): RequestInit {
    const { method = 'GET', headers = {}, data, signal } = config;
    
    const options: RequestInit = {
      method: method as string,
      headers: {
        ...this.defaultHeaders,
        ...headers
      },
      signal
    };
    
    // Add body for non-GET requests
    if (method !== 'GET' && data !== undefined) {
      if (typeof data === 'object' && !(data instanceof FormData)) {
        options.body = JSON.stringify(data);
      } else {
        options.body = data as any;
      }
    }
    
    return options;
  }

  /**
   * Prepare URL with query parameters
   * @param url Base URL
   * @param params Query parameters
   * @returns Full URL with query parameters
   */
  private prepareUrl(url: string, params?: Record<string, any>): string {
    // Combine base URL with provided URL
    let fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    // Add query parameters if provided
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => searchParams.append(`${key}[]`, String(item)));
          } else if (typeof value === 'object') {
            searchParams.append(key, JSON.stringify(value));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      
      const queryString = searchParams.toString();
      
      if (queryString) {
        fullUrl += fullUrl.includes('?') ? `&${queryString}` : `?${queryString}`;
      }
    }
    
    return fullUrl;
  }

  /**
   * Fetch with timeout
   * @param url Request URL
   * @param options Fetch options
   * @param timeout Timeout in milliseconds
   * @returns Fetch response
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout?: number
  ): Promise<Response> {
    if (!timeout) {
      return fetch(url, options);
    }
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      // Add abort signal to options if not already provided
      const fetchOptions = {
        ...options,
        signal: options.signal || controller.signal
      };
      
      return await fetch(url, fetchOptions);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Parse fetch response
   * @param response Fetch response
   * @param config Request configuration
   * @returns API response
   */
  private async parseResponse<T>(
    response: Response,
    config: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {};
    
    // Convert headers to plain object
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    // Parse response body based on content type
    let data: T;
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType.includes('text/')) {
      data = await response.text() as unknown as T;
    } else {
      // For binary data, return blob
      data = await response.blob() as unknown as T;
    }
    
    // Check if response is successful
    if (!response.ok) {
      throw {
        message: `Request failed with status ${response.status}`,
        status: response.status,
        data,
        headers,
        config
      };
    }
    
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers,
      config
    };
  }

  /**
   * Handle and transform error
   * @param error Error object
   * @param config Request configuration
   * @returns API error
   */
  private handleError(error: any, config: ApiRequestConfig): ApiError {
    // Default error structure
    const apiError: ApiError = {
      message: 'An error occurred during the request',
      config
    };
    
    // Handle different error types
    if (error instanceof Error) {
      // Native Error object
      apiError.message = error.message;
      
      // Handle abort error
      if (error.name === 'AbortError') {
        apiError.message = 'Request was aborted';
        apiError.code = 'ECONNABORTED';
      }
    } else if (error.status) {
      // Error from API response
      apiError.status = error.status;
      apiError.message = error.message || `Request failed with status ${error.status}`;
      apiError.details = error.data;
      
      // Add response information
      apiError.response = {
        data: error.data,
        status: error.status,
        headers: error.headers
      };
    }
    
    return apiError;
  }
}
