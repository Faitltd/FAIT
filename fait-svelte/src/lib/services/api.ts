/**
 * API Service
 * 
 * This module provides a centralized API service for making requests to the backend.
 * It handles authentication, error handling, and response processing.
 */

import { supabase } from './supabase';
import type { Profile, Service, Booking as ApiBooking } from './supabase';

// API Error class
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number = 500, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Process Supabase response
 * @param response Supabase response
 * @returns Processed data
 */
function processResponse<T>(response: any): T {
  if (response.error) {
    throw new ApiError(
      response.error.message || 'An error occurred',
      response.error.status || 500,
      response.error
    );
  }
  
  return response.data;
}

/**
 * API Service
 */
export const api = {
  /**
   * Authentication
   */
  auth: {
    /**
     * Sign up a new user
     * @param email User email
     * @param password User password
     * @param userData Additional user data
     * @returns User data
     */
    signUp: async (email: string, password: string, userData: Partial<Profile>) => {
      // 1. Create the user in Supabase Auth
      const authResponse = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'client'
          }
        }
      });

      const user = processResponse(authResponse);

      if (!user.user) {
        throw new ApiError('Failed to create user', 500);
      }

      // 2. Create the user profile in the profiles table
      const profileResponse = await supabase
        .from('profiles')
        .insert({
          user_id: user.user.id,
          name: userData.name,
          role: userData.role || 'client',
          ...userData
        })
        .select()
        .single();

      return {
        user: user.user,
        profile: processResponse<Profile>(profileResponse)
      };
    },

    /**
     * Sign in a user
     * @param email User email
     * @param password User password
     * @returns User data
     */
    signIn: async (email: string, password: string) => {
      const response = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return processResponse(response);
    },

    /**
     * Sign out the current user
     */
    signOut: async () => {
      const response = await supabase.auth.signOut();
      return processResponse(response);
    },

    /**
     * Get the current user
     * @returns Current user data
     */
    getUser: async () => {
      const response = await supabase.auth.getUser();
      return processResponse(response);
    },

    /**
     * Get the current session
     * @returns Current session data
     */
    getSession: async () => {
      const response = await supabase.auth.getSession();
      return processResponse(response);
    }
  },

  /**
   * Bookings
   */
  bookings: {
    /**
     * Get bookings for a user
     * @param userId User ID
     * @param role User role (client or provider)
     * @returns List of bookings
     */
    getByUser: async (userId: string, role: 'client' | 'provider') => {
      const fieldName = role === 'provider' ? 'provider_id' : 'client_id';
      
      const response = await supabase
        .from('bookings')
        .select('*')
        .eq(fieldName, userId)
        .order('date', { ascending: false });

      return processResponse<ApiBooking[]>(response);
    },

    /**
     * Get a booking by ID
     * @param id Booking ID
     * @returns Booking data
     */
    getById: async (id: string) => {
      const response = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      return processResponse<ApiBooking>(response);
    },

    /**
     * Create a new booking
     * @param data Booking data
     * @returns Created booking data
     */
    create: async (data: Omit<ApiBooking, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await supabase
        .from('bookings')
        .insert(data)
        .select()
        .single();

      return processResponse<ApiBooking>(response);
    },

    /**
     * Update a booking
     * @param id Booking ID
     * @param data Booking data to update
     * @returns Updated booking data
     */
    update: async (id: string, data: Partial<ApiBooking>) => {
      const response = await supabase
        .from('bookings')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      return processResponse<ApiBooking>(response);
    },

    /**
     * Delete a booking
     * @param id Booking ID
     */
    delete: async (id: string) => {
      const response = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      return processResponse(response);
    }
  }
};
