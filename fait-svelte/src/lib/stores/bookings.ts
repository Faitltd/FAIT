import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { api } from '$lib/services/api';
import type { ApiError } from '$lib/services/api';
import type { Booking as ApiBooking } from '$lib/services/supabase';
import { auth } from './auth';
import { get } from 'svelte/store';

// Define booking interface for the store
export interface Booking {
  id: string;
  serviceId: string;
  providerId: string;
  clientId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: string;
  address: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Convert API booking to store booking
const mapApiBookingToBooking = (apiBooking: ApiBooking): Booking => {
  return {
    id: apiBooking.id,
    serviceId: apiBooking.service_id,
    providerId: apiBooking.provider_id,
    clientId: apiBooking.client_id,
    date: apiBooking.date,
    time: apiBooking.time,
    status: apiBooking.status,
    price: apiBooking.price.toString(),
    address: apiBooking.address,
    notes: apiBooking.notes,
    createdAt: apiBooking.created_at,
    updatedAt: apiBooking.updated_at
  };
};

// Convert store booking to API booking
const mapBookingToApiBooking = (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Omit<ApiBooking, 'id' | 'created_at' | 'updated_at'> => {
  return {
    service_id: booking.serviceId,
    provider_id: booking.providerId,
    client_id: booking.clientId,
    date: booking.date,
    time: booking.time,
    status: booking.status,
    price: parseFloat(booking.price),
    address: booking.address,
    notes: booking.notes
  };
};

// Initial state
const initialState = {
  bookings: [] as Booking[],
  isLoading: false,
  error: null as string | null
};

// Create the store
const createBookingsStore = () => {
  const { subscribe, set, update } = writable(initialState);

  // Create derived stores for different booking statuses
  const pendingBookings = derived({ subscribe }, $bookings => 
    $bookings.bookings.filter(booking => booking.status === 'pending')
  );

  const confirmedBookings = derived({ subscribe }, $bookings => 
    $bookings.bookings.filter(booking => booking.status === 'confirmed')
  );

  const completedBookings = derived({ subscribe }, $bookings => 
    $bookings.bookings.filter(booking => booking.status === 'completed')
  );

  const cancelledBookings = derived({ subscribe }, $bookings => 
    $bookings.bookings.filter(booking => booking.status === 'cancelled')
  );

  return {
    subscribe,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    
    // Load user bookings
    loadUserBookings: async () => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const authState = get(auth);
        
        if (!authState.user) {
          throw new Error('User not authenticated');
        }
        
        const role = authState.user.role === 'provider' ? 'provider' : 'client';
        const apiBookings = await api.bookings.getByUser(authState.user.id, role);
        
        const bookings = apiBookings.map(mapApiBookingToBooking);
        
        update(state => ({
          ...state,
          bookings,
          isLoading: false,
          error: null
        }));
        
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof ApiError 
          ? error.message 
          : error instanceof Error 
            ? error.message 
            : 'Failed to load bookings';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Get a booking by ID
    getBooking: async (bookingId: string) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        // First check if the booking is already in the store
        const currentState = get({ subscribe });
        let booking = currentState.bookings.find(b => b.id === bookingId);
        
        if (!booking) {
          // If not in store, fetch from API
          const apiBooking = await api.bookings.getById(bookingId);
          booking = mapApiBookingToBooking(apiBooking);
        }
        
        update(state => ({
          ...state,
          isLoading: false,
          error: null
        }));
        
        return { success: true, booking };
      } catch (error) {
        const errorMessage = error instanceof ApiError 
          ? error.message 
          : error instanceof Error 
            ? error.message 
            : 'Failed to get booking';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Create a new booking
    createBooking: async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        // Map to API booking
        const apiBookingData = mapBookingToApiBooking(bookingData);
        
        // Create booking in API
        const apiBooking = await api.bookings.create(apiBookingData);
        
        // Map to store booking
        const newBooking = mapApiBookingToBooking(apiBooking);
        
        // Update store
        update(state => ({
          ...state,
          bookings: [...state.bookings, newBooking],
          isLoading: false,
          error: null
        }));
        
        return { success: true, booking: newBooking };
      } catch (error) {
        const errorMessage = error instanceof ApiError 
          ? error.message 
          : error instanceof Error 
            ? error.message 
            : 'Failed to create booking';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Update a booking
    updateBooking: async (bookingId: string, bookingData: Partial<Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>>) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        // Prepare update data
        const updateData: Partial<ApiBooking> = {};
        
        if (bookingData.date !== undefined) updateData.date = bookingData.date;
        if (bookingData.time !== undefined) updateData.time = bookingData.time;
        if (bookingData.status !== undefined) updateData.status = bookingData.status;
        if (bookingData.price !== undefined) updateData.price = parseFloat(bookingData.price);
        if (bookingData.address !== undefined) updateData.address = bookingData.address;
        if (bookingData.notes !== undefined) updateData.notes = bookingData.notes;
        
        // Update booking in API
        const apiBooking = await api.bookings.update(bookingId, updateData);
        
        // Map to store booking
        const updatedBooking = mapApiBookingToBooking(apiBooking);
        
        // Update store
        update(state => {
          const updatedBookings = [...state.bookings];
          const bookingIndex = updatedBookings.findIndex(booking => booking.id === bookingId);
          
          if (bookingIndex !== -1) {
            updatedBookings[bookingIndex] = updatedBooking;
          }
          
          return {
            ...state,
            bookings: updatedBookings,
            isLoading: false,
            error: null
          };
        });
        
        return { success: true, booking: updatedBooking };
      } catch (error) {
        const errorMessage = error instanceof ApiError 
          ? error.message 
          : error instanceof Error 
            ? error.message 
            : 'Failed to update booking';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Cancel a booking
    cancelBooking: async (bookingId: string) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        // Update booking status to cancelled
        const apiBooking = await api.bookings.update(bookingId, { status: 'cancelled' });
        
        // Map to store booking
        const updatedBooking = mapApiBookingToBooking(apiBooking);
        
        // Update store
        update(state => {
          const updatedBookings = [...state.bookings];
          const bookingIndex = updatedBookings.findIndex(booking => booking.id === bookingId);
          
          if (bookingIndex !== -1) {
            updatedBookings[bookingIndex] = updatedBooking;
          }
          
          return {
            ...state,
            bookings: updatedBookings,
            isLoading: false,
            error: null
          };
        });
        
        return { success: true, booking: updatedBooking };
      } catch (error) {
        const errorMessage = error instanceof ApiError 
          ? error.message 
          : error instanceof Error 
            ? error.message 
            : 'Failed to cancel booking';
        
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
    }
  };
};

// Export the store
export const bookings = createBookingsStore();
