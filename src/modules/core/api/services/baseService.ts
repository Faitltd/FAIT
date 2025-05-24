/**
 * Base Service
 * 
 * This file implements a base service class for domain-specific services.
 */

import { ApiService } from './apiService';
import { ApiRequestConfig, ApiResponse, ApiError } from '../types';

/**
 * Base service class
 */
export abstract class BaseService {
  protected apiService: ApiService;
  protected basePath: string;

  /**
   * Constructor
   * @param apiService API service instance
   * @param basePath Base path for all requests
   */
  constructor(apiService: ApiService, basePath: string = '') {
    this.apiService = apiService;
    this.basePath = basePath;
  }

  /**
   * Build full URL
   * @param path Path to append to base path
   * @returns Full URL
   */
  protected buildUrl(path: string): string {
    // If path starts with http or /, return as is
    if (path.startsWith('http') || path.startsWith('/')) {
      return path;
    }
    
    // If path is empty, return base path
    if (!path) {
      return this.basePath;
    }
    
    // Combine base path and path
    return `${this.basePath}/${path}`.replace(/\/+/g, '/');
  }

  /**
   * Handle API error
   * @param error Error object
   * @param defaultMessage Default error message
   * @returns Formatted error
   */
  protected handleError(error: any, defaultMessage: string = 'An error occurred'): never {
    // Create formatted error
    const formattedError: ApiError = {
      message: defaultMessage,
      ...error
    };
    
    // Log error
    console.error(`[API Error] ${formattedError.message}`, formattedError);
    
    // Throw error
    throw formattedError;
  }

  /**
   * Make a GET request
   * @param path Request path
   * @param config Request configuration
   * @returns API response
   */
  protected async get<T = any>(path: string, config: ApiRequestConfig = {}): Promise<T> {
    try {
      const response = await this.apiService.get<T>(this.buildUrl(path), config);
      return response.data;
    } catch (error) {
      return this.handleError(error, `Failed to get ${path}`);
    }
  }

  /**
   * Make a POST request
   * @param path Request path
   * @param data Request data
   * @param config Request configuration
   * @returns API response
   */
  protected async post<T = any>(path: string, data?: any, config: ApiRequestConfig = {}): Promise<T> {
    try {
      const response = await this.apiService.post<T>(this.buildUrl(path), data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error, `Failed to post to ${path}`);
    }
  }

  /**
   * Make a PUT request
   * @param path Request path
   * @param data Request data
   * @param config Request configuration
   * @returns API response
   */
  protected async put<T = any>(path: string, data?: any, config: ApiRequestConfig = {}): Promise<T> {
    try {
      const response = await this.apiService.put<T>(this.buildUrl(path), data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error, `Failed to put to ${path}`);
    }
  }

  /**
   * Make a PATCH request
   * @param path Request path
   * @param data Request data
   * @param config Request configuration
   * @returns API response
   */
  protected async patch<T = any>(path: string, data?: any, config: ApiRequestConfig = {}): Promise<T> {
    try {
      const response = await this.apiService.patch<T>(this.buildUrl(path), data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error, `Failed to patch ${path}`);
    }
  }

  /**
   * Make a DELETE request
   * @param path Request path
   * @param config Request configuration
   * @returns API response
   */
  protected async delete<T = any>(path: string, config: ApiRequestConfig = {}): Promise<T> {
    try {
      const response = await this.apiService.delete<T>(this.buildUrl(path), config);
      return response.data;
    } catch (error) {
      return this.handleError(error, `Failed to delete ${path}`);
    }
  }

  /**
   * Fetch data with caching
   * @param fetcher Function that fetches data
   * @param cacheKey Cache key
   * @param expiresIn Cache expiration time in milliseconds
   * @returns Fetched data
   */
  protected async fetchWithCache<T>(
    fetcher: () => Promise<T>,
    cacheKey: string,
    expiresIn: number = 5 * 60 * 1000 // 5 minutes default
  ): Promise<T> {
    try {
      return await fetcher();
    } catch (error) {
      return this.handleError(error, `Failed to fetch data for ${cacheKey}`);
    }
  }
}
