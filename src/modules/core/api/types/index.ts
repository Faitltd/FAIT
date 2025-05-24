/**
 * API Types
 * 
 * This file defines the types used in the API module.
 */

/**
 * HTTP methods supported by the API
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  cache?: ApiCacheConfig;
  retry?: ApiRetryConfig;
  signal?: AbortSignal;
}

/**
 * API response
 */
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: ApiRequestConfig;
  cached?: boolean;
}

/**
 * API error
 */
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
  config?: ApiRequestConfig;
  response?: Partial<ApiResponse>;
}

/**
 * API cache configuration
 */
export interface ApiCacheConfig {
  enabled?: boolean;
  ttl?: number; // Time to live in milliseconds
  key?: string; // Custom cache key
  invalidate?: boolean; // Force invalidate cache
}

/**
 * API retry configuration
 */
export interface ApiRetryConfig {
  enabled?: boolean;
  maxRetries?: number;
  retryDelay?: number; // Delay between retries in milliseconds
  retryCondition?: (error: ApiError) => boolean; // Condition to retry
}

/**
 * API circuit breaker configuration
 */
export interface ApiCircuitBreakerConfig {
  enabled?: boolean;
  failureThreshold?: number; // Number of failures before opening circuit
  resetTimeout?: number; // Time to wait before trying again in milliseconds
  fallback?: <T>(config: ApiRequestConfig) => Promise<ApiResponse<T>> | ApiResponse<T>; // Fallback function
}

/**
 * API client interface
 */
export interface ApiClient {
  request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>>;
  get<T = any>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
  delete<T = any>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
}

/**
 * API interceptor functions
 */
export type RequestInterceptor = (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>;
export type ResponseInterceptor = <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
export type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;

/**
 * API service interface
 */
export interface ApiService extends ApiClient {
  addRequestInterceptor(interceptor: RequestInterceptor): () => void;
  addResponseInterceptor(interceptor: ResponseInterceptor): () => void;
  addErrorInterceptor(interceptor: ErrorInterceptor): () => void;
  configureCache(config: Partial<ApiCacheConfig>): void;
  configureRetry(config: Partial<ApiRetryConfig>): void;
  configureCircuitBreaker(config: Partial<ApiCircuitBreakerConfig>): void;
  clearCache(key?: string): void;
}

/**
 * Supabase specific types
 */
export interface SupabaseQueryOptions {
  select?: string;
  order?: Record<string, 'asc' | 'desc'>;
  limit?: number;
  offset?: number;
  count?: 'exact' | 'planned' | 'estimated';
  single?: boolean;
  maybeSingle?: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Sort parameters
 */
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter operator
 */
export type FilterOperator = 
  | 'eq' // Equal
  | 'neq' // Not equal
  | 'gt' // Greater than
  | 'gte' // Greater than or equal
  | 'lt' // Less than
  | 'lte' // Less than or equal
  | 'like' // Like (case sensitive)
  | 'ilike' // Case insensitive like
  | 'in' // In array
  | 'is' // Is (for null/not null)
  | 'contains' // Contains (for arrays/jsonb)
  | 'overlaps' // Overlaps (for arrays/jsonb)
  | 'startsWith' // Starts with
  | 'endsWith'; // Ends with

/**
 * Filter parameter
 */
export interface FilterParam {
  field: string;
  operator: FilterOperator;
  value: any;
}

/**
 * Query parameters
 */
export interface QueryParams {
  filters?: FilterParam[];
  sort?: SortParams[];
  pagination?: PaginationParams;
  search?: string;
  include?: string[];
}

/**
 * Cache entry
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}
