/**
 * API Services
 * 
 * This file exports the API services.
 */

import { ApiService } from './apiService';
export { ApiService } from './apiService';
export { BaseService } from './baseService';

// Create a singleton instance of the API service
const apiService = new ApiService();

// Export the singleton instance
export { apiService };
