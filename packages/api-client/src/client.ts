import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ApiError, PaginatedResponse, Project, Service, User } from './types';

export interface ApiClientConfig {
  baseUrl: string;
  supabaseUrl: string;
  supabaseKey: string;
  headers?: Record<string, string>;
}

export class ApiClient {
  private axios: AxiosInstance;
  private supabase: SupabaseClient;

  constructor(config: ApiClientConfig) {
    this.axios = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);

    // Add response interceptor for error handling
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const apiError: ApiError = {
            code: `HTTP_${error.response.status}`,
            message: error.response.data.message || 'An error occurred',
            details: error.response.data.details,
          };
          return Promise.reject(apiError);
        } else if (error.request) {
          // The request was made but no response was received
          const apiError: ApiError = {
            code: 'NETWORK_ERROR',
            message: 'Network error, no response received',
          };
          return Promise.reject(apiError);
        } else {
          // Something happened in setting up the request that triggered an Error
          const apiError: ApiError = {
            code: 'REQUEST_SETUP_ERROR',
            message: error.message,
          };
          return Promise.reject(apiError);
        }
      }
    );
  }

  // Auth methods
  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw {
        code: error.code || 'AUTH_ERROR',
        message: error.message,
      } as ApiError;
    }
    
    return data;
  }

  async signup(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      throw {
        code: error.code || 'AUTH_ERROR',
        message: error.message,
      } as ApiError;
    }
    
    return data;
  }

  async logout() {
    const { error } = await this.supabase.auth.signOut();
    
    if (error) {
      throw {
        code: error.code || 'AUTH_ERROR',
        message: error.message,
      } as ApiError;
    }
  }

  // User methods
  async getCurrentUser(): Promise<User> {
    const { data, error } = await this.supabase.auth.getUser();
    
    if (error) {
      throw {
        code: error.code || 'AUTH_ERROR',
        message: error.message,
      } as ApiError;
    }
    
    return this.get<User>(`/users/${data.user.id}`);
  }

  async getUser(id: string): Promise<User> {
    return this.get<User>(`/users/${id}`);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    return this.patch<User>(`/users/${id}`, userData);
  }

  // Project methods
  async getProjects(page = 1, pageSize = 10): Promise<PaginatedResponse<Project>> {
    return this.get<PaginatedResponse<Project>>('/projects', {
      params: { page, pageSize },
    });
  }

  async getProject(id: string): Promise<Project> {
    return this.get<Project>(`/projects/${id}`);
  }

  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    return this.post<Project>('/projects', projectData);
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    return this.patch<Project>(`/projects/${id}`, projectData);
  }

  async deleteProject(id: string): Promise<void> {
    return this.delete(`/projects/${id}`);
  }

  // Service methods
  async getServices(page = 1, pageSize = 10): Promise<PaginatedResponse<Service>> {
    return this.get<PaginatedResponse<Service>>('/services', {
      params: { page, pageSize },
    });
  }

  async getService(id: string): Promise<Service> {
    return this.get<Service>(`/services/${id}`);
  }

  // Generic request methods
  private async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axios.get(url, config);
    return response.data;
  }

  private async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axios.post(url, data, config);
    return response.data;
  }

  private async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axios.patch(url, data, config);
    return response.data;
  }

  private async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axios.delete(url, config);
    return response.data;
  }
}
