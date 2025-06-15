import { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../services/bookingService';
import { Booking, BookingFormData } from '../types/booking';
import { PaginatedResult, QueryParams } from '../../core/types/common';

interface UseBookingsResult {
  bookings: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  fetchBookings: (params?: QueryParams) => Promise<void>;
  createBooking: (booking: BookingFormData) => Promise<Booking>;
  updateBooking: (id: string, booking: Partial<Booking>) => Promise<Booking>;
  cancelBooking: (id: string, reason?: string) => Promise<Booking>;
  rescheduleBooking: (
    id: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    reason?: string
  ) => Promise<Booking>;
  completeBooking: (id: string, finalPrice?: number) => Promise<Booking>;
}

/**
 * Hook for managing bookings
 */
export function useBookings(initialParams?: QueryParams): UseBookingsResult {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(initialParams?.pagination?.page || 1);
  const [limit, setLimit] = useState<number>(initialParams?.pagination?.limit || 10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async (params?: QueryParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await bookingService.getBookings(params);
      const result = response.data;
      
      setBookings(result.data);
      setTotal(result.total);
      setPage(result.page);
      setLimit(result.limit);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (booking: BookingFormData): Promise<Booking> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await bookingService.createBooking(booking);
      
      // Refresh bookings list
      fetchBookings({ pagination: { page, limit } });
      
      return response.data;
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchBookings, page, limit]);

  const updateBooking = useCallback(async (id: string, booking: Partial<Booking>): Promise<Booking> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await bookingService.updateBooking(id, booking);
      
      // Update booking in list
      setBookings((prevBookings) =>
        prevBookings.map((b) => (b.id === id ? { ...b, ...response.data } : b))
      );
      
      return response.data;
    } catch (err) {
      console.error('Error updating booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to update booking');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (id: string, reason?: string): Promise<Booking> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await bookingService.cancelBooking(id, reason);
      
      // Update booking in list
      setBookings((prevBookings) =>
        prevBookings.map((b) => (b.id === id ? { ...b, ...response.data } : b))
      );
      
      return response.data;
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rescheduleBooking = useCallback(
    async (
      id: string,
      newDate: string,
      newStartTime: string,
      newEndTime: string,
      reason?: string
    ): Promise<Booking> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await bookingService.rescheduleBooking(
          id,
          newDate,
          newStartTime,
          newEndTime,
          reason
        );
        
        // Update booking in list
        setBookings((prevBookings) =>
          prevBookings.map((b) => (b.id === id ? { ...b, ...response.data } : b))
        );
        
        return response.data;
      } catch (err) {
        console.error('Error rescheduling booking:', err);
        setError(err instanceof Error ? err.message : 'Failed to reschedule booking');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const completeBooking = useCallback(async (id: string, finalPrice?: number): Promise<Booking> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await bookingService.completeBooking(id, finalPrice);
      
      // Update booking in list
      setBookings((prevBookings) =>
        prevBookings.map((b) => (b.id === id ? { ...b, ...response.data } : b))
      );
      
      return response.data;
    } catch (err) {
      console.error('Error completing booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete booking');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch bookings on mount
  useEffect(() => {
    fetchBookings(initialParams);
  }, [fetchBookings, initialParams]);

  return {
    bookings,
    total,
    page,
    limit,
    totalPages,
    isLoading,
    error,
    fetchBookings,
    createBooking,
    updateBooking,
    cancelBooking,
    rescheduleBooking,
    completeBooking,
  };
}
