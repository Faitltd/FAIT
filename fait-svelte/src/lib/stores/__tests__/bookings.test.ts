import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bookings } from '../bookings';
import { api } from '$lib/services/api';
import { auth } from '../auth';
import { get } from 'svelte/store';

// Mock the API and auth store
vi.mock('$lib/services/api', () => ({
  api: {
    bookings: {
      getByUser: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    }
  }
}));

vi.mock('../auth', () => ({
  auth: {
    subscribe: vi.fn(),
    user: { id: 'user-123', role: 'client' }
  }
}));

describe('Bookings Store', () => {
  const mockBookings = [
    {
      id: 'booking-1',
      service_id: 'service-1',
      provider_id: 'provider-1',
      client_id: 'user-123',
      date: '2023-06-15',
      time: '14:00',
      status: 'pending',
      price: 50,
      address: '123 Main St',
      notes: 'Please bring cleaning supplies',
      created_at: '2023-06-10T12:00:00Z',
      updated_at: '2023-06-10T12:00:00Z'
    },
    {
      id: 'booking-2',
      service_id: 'service-2',
      provider_id: 'provider-2',
      client_id: 'user-123',
      date: '2023-06-20',
      time: '10:00',
      status: 'confirmed',
      price: 75,
      address: '456 Oak St',
      notes: '',
      created_at: '2023-06-11T09:00:00Z',
      updated_at: '2023-06-12T14:00:00Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset the store to initial state
    const initialState = get(bookings);
    bookings.loadUserBookings = vi.fn().mockResolvedValue({ success: true });
    
    // Mock auth.subscribe to return a user
    vi.mocked(auth.subscribe).mockImplementation(callback => {
      callback({ user: { id: 'user-123', role: 'client' } });
      return () => {};
    });
  });

  describe('loadUserBookings', () => {
    it('should load user bookings successfully', async () => {
      // Mock API response
      vi.mocked(api.bookings.getByUser).mockResolvedValue(mockBookings);
      
      // Call the method
      const result = await bookings.loadUserBookings();
      
      // Check that the API was called correctly
      expect(api.bookings.getByUser).toHaveBeenCalledWith('user-123', 'client');
      
      // Check the result
      expect(result).toEqual({ success: true });
      
      // Check that the store was updated
      const state = get(bookings);
      expect(state.bookings.length).toBe(2);
      expect(state.bookings[0].id).toBe('booking-1');
      expect(state.bookings[1].id).toBe('booking-2');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle API errors', async () => {
      // Mock API error
      vi.mocked(api.bookings.getByUser).mockRejectedValue(new Error('API error'));
      
      // Call the method
      const result = await bookings.loadUserBookings();
      
      // Check the result
      expect(result).toEqual({ success: false, error: 'API error' });
      
      // Check that the store was updated with the error
      const state = get(bookings);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('API error');
    });
  });

  describe('getBooking', () => {
    it('should get a booking by ID from the API', async () => {
      // Mock API response
      vi.mocked(api.bookings.getById).mockResolvedValue(mockBookings[0]);
      
      // Call the method
      const result = await bookings.getBooking('booking-1');
      
      // Check that the API was called correctly
      expect(api.bookings.getById).toHaveBeenCalledWith('booking-1');
      
      // Check the result
      expect(result).toEqual({
        success: true,
        booking: {
          id: 'booking-1',
          serviceId: 'service-1',
          providerId: 'provider-1',
          clientId: 'user-123',
          date: '2023-06-15',
          time: '14:00',
          status: 'pending',
          price: '50',
          address: '123 Main St',
          notes: 'Please bring cleaning supplies',
          createdAt: '2023-06-10T12:00:00Z',
          updatedAt: '2023-06-10T12:00:00Z'
        }
      });
    });

    it('should return a booking from the store if it exists', async () => {
      // First load bookings into the store
      vi.mocked(api.bookings.getByUser).mockResolvedValue(mockBookings);
      await bookings.loadUserBookings();
      
      // Reset the mock to check if it's called
      vi.mocked(api.bookings.getById).mockClear();
      
      // Call the method
      const result = await bookings.getBooking('booking-1');
      
      // Check that the API was NOT called
      expect(api.bookings.getById).not.toHaveBeenCalled();
      
      // Check the result
      expect(result.success).toBe(true);
      expect(result.booking?.id).toBe('booking-1');
    });
  });

  describe('createBooking', () => {
    it('should create a new booking', async () => {
      // Mock API response
      vi.mocked(api.bookings.create).mockResolvedValue({
        id: 'new-booking',
        service_id: 'service-3',
        provider_id: 'provider-3',
        client_id: 'user-123',
        date: '2023-06-25',
        time: '16:00',
        status: 'pending',
        price: 100,
        address: '789 Pine St',
        notes: 'Call before arrival',
        created_at: '2023-06-15T10:00:00Z',
        updated_at: '2023-06-15T10:00:00Z'
      });
      
      // Call the method
      const result = await bookings.createBooking({
        serviceId: 'service-3',
        providerId: 'provider-3',
        clientId: 'user-123',
        date: '2023-06-25',
        time: '16:00',
        status: 'pending',
        price: '100',
        address: '789 Pine St',
        notes: 'Call before arrival'
      });
      
      // Check that the API was called correctly
      expect(api.bookings.create).toHaveBeenCalledWith({
        service_id: 'service-3',
        provider_id: 'provider-3',
        client_id: 'user-123',
        date: '2023-06-25',
        time: '16:00',
        status: 'pending',
        price: 100,
        address: '789 Pine St',
        notes: 'Call before arrival'
      });
      
      // Check the result
      expect(result.success).toBe(true);
      expect(result.booking?.id).toBe('new-booking');
      
      // Check that the store was updated
      const state = get(bookings);
      expect(state.bookings.length).toBe(1);
      expect(state.bookings[0].id).toBe('new-booking');
    });
  });

  describe('cancelBooking', () => {
    it('should cancel a booking', async () => {
      // Mock API response
      vi.mocked(api.bookings.update).mockResolvedValue({
        ...mockBookings[0],
        status: 'cancelled',
        updated_at: '2023-06-15T15:00:00Z'
      });
      
      // First load bookings into the store
      vi.mocked(api.bookings.getByUser).mockResolvedValue(mockBookings);
      await bookings.loadUserBookings();
      
      // Call the method
      const result = await bookings.cancelBooking('booking-1');
      
      // Check that the API was called correctly
      expect(api.bookings.update).toHaveBeenCalledWith('booking-1', { status: 'cancelled' });
      
      // Check the result
      expect(result.success).toBe(true);
      expect(result.booking?.status).toBe('cancelled');
      
      // Check that the store was updated
      const state = get(bookings);
      const cancelledBooking = state.bookings.find(b => b.id === 'booking-1');
      expect(cancelledBooking?.status).toBe('cancelled');
    });
  });
});
