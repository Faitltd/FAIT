import { ApiResponse, ApiError, QueryParams } from '../types/common';

/**
 * Base API service for making HTTP requests
 */
class ApiService {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set authorization token for API requests
   */
  setAuthToken(token: string | null): void {
    if (token) {
      this.defaultHeaders = {
        ...this.defaultHeaders,
        Authorization: `Bearer ${token}`,
      };
    } else {
      const { Authorization, ...headers } = this.defaultHeaders;
      this.defaultHeaders = headers;
    }
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: QueryParams): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      // Add pagination params
      if (params.pagination) {
        url.searchParams.append('page', params.pagination.page.toString());
        url.searchParams.append('limit', params.pagination.limit.toString());
      }
      
      // Add sort params
      if (params.sort) {
        url.searchParams.append('sort', params.sort.field);
        url.searchParams.append('direction', params.sort.direction);
      }
      
      // Add filter params
      if (params.filter) {
        Object.entries(params.filter).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if (Array.isArray(value)) {
              value.forEach(v => url.searchParams.append(`${key}[]`, v.toString()));
            } else {
              url.searchParams.append(key, value.toString());
            }
          }
        });
      }
    }
    
    return url.toString();
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw {
        message: errorData.message || 'An error occurred',
        code: errorData.code || response.status.toString(),
        details: errorData.details,
      };
    }
    
    const data = await response.json();
    return {
      data,
      success: true,
    };
  }

  /**
   * Make a GET request
   */
  async get<T>(endpoint: string, params?: QueryParams): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint, params);
      const response = await fetch(url, {
        method: 'GET',
        headers: this.defaultHeaders,
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`GET ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * Make a POST request
   */
  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint);
      const response = await fetch(url, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(data),
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`POST ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * Make a PUT request
   */
  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint);
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.defaultHeaders,
        body: JSON.stringify(data),
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`PUT ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint);
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.defaultHeaders,
        body: JSON.stringify(data),
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`PATCH ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.defaultHeaders,
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`DELETE ${endpoint} error:`, error);
      throw error;
    }
  }

  /**
   * Upload a file
   */
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint);
      const formData = new FormData();
      formData.append('file', file);
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }
      
      const headers = { ...this.defaultHeaders };
      delete headers['Content-Type']; // Let the browser set the content type for form data
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`File upload to ${endpoint} error:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
