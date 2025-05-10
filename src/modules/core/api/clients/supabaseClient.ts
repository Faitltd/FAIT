/**
 * Supabase API Client
 * 
 * This file implements an API client for Supabase.
 */

import { BaseApiClient } from './baseClient';
import {
  ApiRequestConfig,
  ApiResponse,
  ApiError,
  SupabaseQueryOptions,
  FilterParam,
  SortParams,
  PaginationParams
} from '../types';
import apiCache from '../cache';
import { supabase } from '../../../../lib/supabase';

/**
 * Supabase API client implementation
 */
export class SupabaseApiClient extends BaseApiClient {
  /**
   * Make a Supabase request
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
      
      // Execute Supabase query
      const { data, error, status, statusText } = await this.executeSupabaseQuery<T>(modifiedConfig);
      
      // Handle error
      if (error) {
        throw {
          message: error.message,
          status: error.code === 'PGRST116' ? 404 : status,
          code: error.code,
          details: error.details,
          config: modifiedConfig
        };
      }
      
      // Create API response
      const apiResponse: ApiResponse<T> = {
        data,
        status: status || 200,
        statusText: statusText || 'OK',
        headers: {}, // Supabase doesn't provide headers
        config: modifiedConfig
      };
      
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
   * Execute a Supabase query
   * @param config Request configuration
   * @returns Supabase response
   */
  private async executeSupabaseQuery<T>(config: ApiRequestConfig): Promise<any> {
    const { method = 'GET', url = '', data, params = {} } = config;
    
    // Extract table name from URL
    const table = url.replace(/^\//, '');
    
    // Extract Supabase query options
    const queryOptions = this.extractQueryOptions(params);
    
    // Extract filters, sort, and pagination
    const filters = params.filters as FilterParam[] || [];
    const sort = params.sort as SortParams[] || [];
    const pagination = params.pagination as PaginationParams || {};
    
    // Start building query
    let query = supabase.from(table);
    
    // Apply method
    switch (method) {
      case 'GET': {
        // Select query
        query = query.select(queryOptions.select || '*');
        
        // Apply filters
        filters.forEach(filter => {
          this.applyFilter(query, filter);
        });
        
        // Apply sorting
        sort.forEach(({ field, direction }) => {
          query = query.order(field, { ascending: direction === 'asc' });
        });
        
        // Apply pagination
        if (pagination.limit) {
          query = query.limit(pagination.limit);
        }
        
        if (pagination.offset) {
          query = query.range(pagination.offset, pagination.offset + (pagination.limit || 10) - 1);
        } else if (pagination.page && pagination.limit) {
          const offset = (pagination.page - 1) * pagination.limit;
          query = query.range(offset, offset + pagination.limit - 1);
        }
        
        // Apply single/maybeSingle
        if (queryOptions.single) {
          return query.single();
        } else if (queryOptions.maybeSingle) {
          return query.maybeSingle();
        }
        
        return query;
      }
      
      case 'POST': {
        // Insert query
        return query.insert(data);
      }
      
      case 'PUT': {
        // Upsert query
        return query.upsert(data);
      }
      
      case 'PATCH': {
        // Update query
        query = query.update(data);
        
        // Apply filters
        filters.forEach(filter => {
          this.applyFilter(query, filter);
        });
        
        return query;
      }
      
      case 'DELETE': {
        // Delete query
        query = query.delete();
        
        // Apply filters
        filters.forEach(filter => {
          this.applyFilter(query, filter);
        });
        
        return query;
      }
      
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  /**
   * Extract Supabase query options from params
   * @param params Request parameters
   * @returns Supabase query options
   */
  private extractQueryOptions(params: Record<string, any>): SupabaseQueryOptions {
    const options: SupabaseQueryOptions = {};
    
    // Extract select
    if (params.select) {
      options.select = params.select;
    }
    
    // Extract order
    if (params.order) {
      options.order = params.order;
    }
    
    // Extract limit
    if (params.limit) {
      options.limit = params.limit;
    }
    
    // Extract offset
    if (params.offset) {
      options.offset = params.offset;
    }
    
    // Extract count
    if (params.count) {
      options.count = params.count;
    }
    
    // Extract single
    if (params.single) {
      options.single = params.single;
    }
    
    // Extract maybeSingle
    if (params.maybeSingle) {
      options.maybeSingle = params.maybeSingle;
    }
    
    return options;
  }

  /**
   * Apply a filter to a Supabase query
   * @param query Supabase query
   * @param filter Filter parameter
   */
  private applyFilter(query: any, filter: FilterParam): void {
    const { field, operator, value } = filter;
    
    switch (operator) {
      case 'eq':
        query.eq(field, value);
        break;
      case 'neq':
        query.neq(field, value);
        break;
      case 'gt':
        query.gt(field, value);
        break;
      case 'gte':
        query.gte(field, value);
        break;
      case 'lt':
        query.lt(field, value);
        break;
      case 'lte':
        query.lte(field, value);
        break;
      case 'like':
        query.like(field, value);
        break;
      case 'ilike':
        query.ilike(field, value);
        break;
      case 'in':
        query.in(field, value);
        break;
      case 'is':
        query.is(field, value);
        break;
      case 'contains':
        query.contains(field, value);
        break;
      case 'overlaps':
        query.overlaps(field, value);
        break;
      case 'startsWith':
        query.like(field, `${value}%`);
        break;
      case 'endsWith':
        query.like(field, `%${value}`);
        break;
      default:
        console.warn(`Unsupported operator: ${operator}`);
    }
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
    } else if (error.code) {
      // Supabase error
      apiError.message = error.message || 'Supabase error';
      apiError.code = error.code;
      apiError.details = error.details;
      apiError.status = error.status || 500;
    }
    
    return apiError;
  }
}
