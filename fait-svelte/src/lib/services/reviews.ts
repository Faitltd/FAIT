/**
 * Reviews Service
 * 
 * This module provides a centralized service for managing reviews.
 */

import { supabase } from './supabase';
import type { ApiError } from './api';

// Review type
export type Review = {
  id: string;
  bookingId: string;
  serviceId: string;
  providerId: string;
  clientId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Process API response
 * @param response API response
 * @returns Processed data
 * @throws ApiError if response contains an error
 */
const processResponse = <T>(response: { data: T | null; error: any }) => {
  if (response.error) {
    console.error('Reviews API Error:', response.error);
    throw {
      message: response.error.message || 'An error occurred',
      status: response.error.status || 500,
      data: response.error
    };
  }
  return response.data;
};

/**
 * Reviews Service
 */
export const reviewsService = {
  /**
   * Get reviews for a service
   * @param serviceId Service ID
   * @returns List of reviews
   */
  getReviewsByService: async (serviceId: string): Promise<Review[]> => {
    try {
      const response = await supabase
        .from('reviews')
        .select('*')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });

      return processResponse<any[]>(response).map(review => ({
        id: review.id,
        bookingId: review.booking_id,
        serviceId: review.service_id,
        providerId: review.provider_id,
        clientId: review.client_id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        updatedAt: review.updated_at
      }));
    } catch (error) {
      console.error('Error getting reviews by service:', error);
      throw error;
    }
  },

  /**
   * Get reviews for a provider
   * @param providerId Provider ID
   * @returns List of reviews
   */
  getReviewsByProvider: async (providerId: string): Promise<Review[]> => {
    try {
      const response = await supabase
        .from('reviews')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      return processResponse<any[]>(response).map(review => ({
        id: review.id,
        bookingId: review.booking_id,
        serviceId: review.service_id,
        providerId: review.provider_id,
        clientId: review.client_id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        updatedAt: review.updated_at
      }));
    } catch (error) {
      console.error('Error getting reviews by provider:', error);
      throw error;
    }
  },

  /**
   * Get reviews by a client
   * @param clientId Client ID
   * @returns List of reviews
   */
  getReviewsByClient: async (clientId: string): Promise<Review[]> => {
    try {
      const response = await supabase
        .from('reviews')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      return processResponse<any[]>(response).map(review => ({
        id: review.id,
        bookingId: review.booking_id,
        serviceId: review.service_id,
        providerId: review.provider_id,
        clientId: review.client_id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        updatedAt: review.updated_at
      }));
    } catch (error) {
      console.error('Error getting reviews by client:', error);
      throw error;
    }
  },

  /**
   * Get review by booking ID
   * @param bookingId Booking ID
   * @returns Review or null if not found
   */
  getReviewByBooking: async (bookingId: string): Promise<Review | null> => {
    try {
      const response = await supabase
        .from('reviews')
        .select('*')
        .eq('booking_id', bookingId)
        .single();

      if (response.error && response.error.code === 'PGRST116') {
        // No review found
        return null;
      }

      const review = processResponse<any>(response);

      return {
        id: review.id,
        bookingId: review.booking_id,
        serviceId: review.service_id,
        providerId: review.provider_id,
        clientId: review.client_id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        updatedAt: review.updated_at
      };
    } catch (error) {
      console.error('Error getting review by booking:', error);
      throw error;
    }
  },

  /**
   * Create a review
   * @param reviewData Review data
   * @returns Created review
   */
  createReview: async (reviewData: {
    bookingId: string;
    serviceId: string;
    providerId: string;
    clientId: string;
    rating: number;
    comment: string;
  }): Promise<Review> => {
    try {
      const response = await supabase
        .from('reviews')
        .insert({
          booking_id: reviewData.bookingId,
          service_id: reviewData.serviceId,
          provider_id: reviewData.providerId,
          client_id: reviewData.clientId,
          rating: reviewData.rating,
          comment: reviewData.comment
        })
        .select()
        .single();

      const review = processResponse<any>(response);

      return {
        id: review.id,
        bookingId: review.booking_id,
        serviceId: review.service_id,
        providerId: review.provider_id,
        clientId: review.client_id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        updatedAt: review.updated_at
      };
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  /**
   * Update a review
   * @param reviewId Review ID
   * @param reviewData Review data
   * @returns Updated review
   */
  updateReview: async (
    reviewId: string,
    reviewData: {
      rating?: number;
      comment?: string;
    }
  ): Promise<Review> => {
    try {
      const response = await supabase
        .from('reviews')
        .update({
          rating: reviewData.rating,
          comment: reviewData.comment
        })
        .eq('id', reviewId)
        .select()
        .single();

      const review = processResponse<any>(response);

      return {
        id: review.id,
        bookingId: review.booking_id,
        serviceId: review.service_id,
        providerId: review.provider_id,
        clientId: review.client_id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        updatedAt: review.updated_at
      };
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  /**
   * Delete a review
   * @param reviewId Review ID
   */
  deleteReview: async (reviewId: string): Promise<void> => {
    try {
      const response = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      processResponse(response);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  /**
   * Get average rating for a service
   * @param serviceId Service ID
   * @returns Average rating and count
   */
  getServiceRating: async (serviceId: string): Promise<{ average: number; count: number }> => {
    try {
      const reviews = await reviewsService.getReviewsByService(serviceId);
      
      if (reviews.length === 0) {
        return { average: 0, count: 0 };
      }
      
      const sum = reviews.reduce((total, review) => total + review.rating, 0);
      const average = sum / reviews.length;
      
      return { average, count: reviews.length };
    } catch (error) {
      console.error('Error getting service rating:', error);
      throw error;
    }
  },

  /**
   * Get average rating for a provider
   * @param providerId Provider ID
   * @returns Average rating and count
   */
  getProviderRating: async (providerId: string): Promise<{ average: number; count: number }> => {
    try {
      const reviews = await reviewsService.getReviewsByProvider(providerId);
      
      if (reviews.length === 0) {
        return { average: 0, count: 0 };
      }
      
      const sum = reviews.reduce((total, review) => total + review.rating, 0);
      const average = sum / reviews.length;
      
      return { average, count: reviews.length };
    } catch (error) {
      console.error('Error getting provider rating:', error);
      throw error;
    }
  }
};
