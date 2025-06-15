import axios, { AxiosInstance, AxiosError } from 'axios';
import { Logger } from '../logging/Logger';
import { environment } from '../../config/environment';

export class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  private logger: Logger;

  private constructor() {
    this.logger = new Logger('ApiClient');
    this.axiosInstance = axios.create({
      baseURL: environment.apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        this.logger.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleApiError(error: AxiosError) {
    const errorResponse = error.response;
    
    if (!errorResponse) {
      this.logger.error('Network Error:', error);
      throw new Error('Network error occurred');
    }

    switch (errorResponse.status) {
      case 401:
        this.handleUnauthorized();
        break;
      case 403:
        this.logger.warn('Forbidden access:', errorResponse.data);
        break;
      case 429:
        this.handleRateLimit(errorResponse);
        break;
      default:
        this.logger.error('API Error:', {
          status: errorResponse.status,
          data: errorResponse.data,
          url: errorResponse.config.url,
        });
    }

    throw error;
  }

  private handleUnauthorized() {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }

  private handleRateLimit(response: any) {
    const retryAfter = response.headers['retry-after'];
    this.logger.warn('Rate limited. Retry after:', retryAfter);
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  public async get<T>(url: string, config = {}) {
    return this.axiosInstance.get<T>(url, config);
  }

  public async post<T>(url: string, data: any, config = {}) {
    return this.axiosInstance.post<T>(url, data, config);
  }

  // Add other methods as needed
}