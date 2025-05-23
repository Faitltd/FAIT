import { writable, derived } from 'svelte/store';
import { reviewsService } from '$lib/services/reviews';
import type { Review } from '$lib/services/reviews';
import { auth } from './auth';
import { get } from 'svelte/store';

// Initial state
const initialState = {
  reviews: [] as Review[],
  serviceRatings: {} as Record<string, { average: number; count: number }>,
  providerRatings: {} as Record<string, { average: number; count: number }>,
  isLoading: false,
  error: null as string | null
};

// Create the store
const createReviewsStore = () => {
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    
    // Load reviews for a service
    loadServiceReviews: async (serviceId: string) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const reviews = await reviewsService.getReviewsByService(serviceId);
        
        update(state => ({
          ...state,
          reviews,
          isLoading: false,
          error: null
        }));
        
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load reviews';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Load reviews for a provider
    loadProviderReviews: async (providerId: string) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const reviews = await reviewsService.getReviewsByProvider(providerId);
        
        update(state => ({
          ...state,
          reviews,
          isLoading: false,
          error: null
        }));
        
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load reviews';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Load reviews by a client
    loadClientReviews: async (clientId: string) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const reviews = await reviewsService.getReviewsByClient(clientId);
        
        update(state => ({
          ...state,
          reviews,
          isLoading: false,
          error: null
        }));
        
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load reviews';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Get review for a booking
    getReviewForBooking: async (bookingId: string) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const review = await reviewsService.getReviewByBooking(bookingId);
        
        update(state => ({
          ...state,
          isLoading: false,
          error: null
        }));
        
        return { success: true, review };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to get review';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Create a review
    createReview: async (reviewData: {
      bookingId: string;
      serviceId: string;
      providerId: string;
      clientId: string;
      rating: number;
      comment: string;
    }) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const review = await reviewsService.createReview(reviewData);
        
        update(state => ({
          ...state,
          reviews: [review, ...state.reviews],
          isLoading: false,
          error: null
        }));
        
        return { success: true, review };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create review';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Update a review
    updateReview: async (reviewId: string, reviewData: { rating?: number; comment?: string }) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const review = await reviewsService.updateReview(reviewId, reviewData);
        
        update(state => {
          const updatedReviews = state.reviews.map(r => 
            r.id === reviewId ? review : r
          );
          
          return {
            ...state,
            reviews: updatedReviews,
            isLoading: false,
            error: null
          };
        });
        
        return { success: true, review };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update review';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Delete a review
    deleteReview: async (reviewId: string) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        await reviewsService.deleteReview(reviewId);
        
        update(state => ({
          ...state,
          reviews: state.reviews.filter(r => r.id !== reviewId),
          isLoading: false,
          error: null
        }));
        
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete review';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Get service rating
    getServiceRating: async (serviceId: string) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        // Check if we already have the rating
        if (state.serviceRatings[serviceId]) {
          update(state => ({
            ...state,
            isLoading: false,
            error: null
          }));
          
          return { 
            success: true, 
            rating: state.serviceRatings[serviceId] 
          };
        }
        
        // Get rating from service
        const rating = await reviewsService.getServiceRating(serviceId);
        
        update(state => ({
          ...state,
          serviceRatings: {
            ...state.serviceRatings,
            [serviceId]: rating
          },
          isLoading: false,
          error: null
        }));
        
        return { success: true, rating };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to get service rating';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Get provider rating
    getProviderRating: async (providerId: string) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        // Check if we already have the rating
        if (state.providerRatings[providerId]) {
          update(state => ({
            ...state,
            isLoading: false,
            error: null
          }));
          
          return { 
            success: true, 
            rating: state.providerRatings[providerId] 
          };
        }
        
        // Get rating from service
        const rating = await reviewsService.getProviderRating(providerId);
        
        update(state => ({
          ...state,
          providerRatings: {
            ...state.providerRatings,
            [providerId]: rating
          },
          isLoading: false,
          error: null
        }));
        
        return { success: true, rating };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to get provider rating';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Clear error
    clearError: () => {
      update(state => ({ ...state, error: null }));
    },
    
    // Reset store
    reset: () => {
      set(initialState);
    }
  };
};

// Export the store
export const reviews = createReviewsStore();
