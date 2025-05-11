import { apiService } from '../../core/services/apiService';
import { 
  Booking, 
  TimeSlot, 
  Availability, 
  Unavailability,
  BookingFormData
} from '../types/booking';
import { ApiResponse, PaginatedResult, QueryParams } from '../../core/types/common';

/**
 * Booking service for managing bookings
 */
class BookingService {
  private baseEndpoint = '/bookings';

  /**
   * Get all bookings
   */
  async getBookings(params?: QueryParams): Promise<ApiResponse<PaginatedResult<Booking>>> {
    return apiService.get<PaginatedResult<Booking>>(this.baseEndpoint, params);
  }

  /**
   * Get a booking by ID
   */
  async getBooking(id: string): Promise<ApiResponse<Booking>> {
    return apiService.get<Booking>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Create a new booking
   */
  async createBooking(booking: BookingFormData): Promise<ApiResponse<Booking>> {
    return apiService.post<Booking>(this.baseEndpoint, booking);
  }

  /**
   * Update a booking
   */
  async updateBooking(id: string, booking: Partial<Booking>): Promise<ApiResponse<Booking>> {
    return apiService.put<Booking>(`${this.baseEndpoint}/${id}`, booking);
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(id: string, reason?: string): Promise<ApiResponse<Booking>> {
    return apiService.post<Booking>(`${this.baseEndpoint}/${id}/cancel`, { reason });
  }

  /**
   * Reschedule a booking
   */
  async rescheduleBooking(
    id: string, 
    newDate: string, 
    newStartTime: string, 
    newEndTime: string, 
    reason?: string
  ): Promise<ApiResponse<Booking>> {
    return apiService.post<Booking>(`${this.baseEndpoint}/${id}/reschedule`, {
      newDate,
      newStartTime,
      newEndTime,
      reason
    });
  }

  /**
   * Complete a booking
   */
  async completeBooking(id: string, finalPrice?: number): Promise<ApiResponse<Booking>> {
    return apiService.post<Booking>(`${this.baseEndpoint}/${id}/complete`, { finalPrice });
  }

  /**
   * Get available time slots
   */
  async getAvailableTimeSlots(
    serviceId: string, 
    date: string, 
    locationZipCode?: string
  ): Promise<ApiResponse<TimeSlot[]>> {
    return apiService.get<TimeSlot[]>('/time-slots', {
      filter: {
        serviceId,
        date,
        locationZipCode,
        available: true
      }
    });
  }

  /**
   * Get service agent availability
   */
  async getServiceAgentAvailability(
    serviceAgentId: string
  ): Promise<ApiResponse<Availability[]>> {
    return apiService.get<Availability[]>(`/service-agents/${serviceAgentId}/availability`);
  }

  /**
   * Update service agent availability
   */
  async updateServiceAgentAvailability(
    serviceAgentId: string,
    availability: Availability[]
  ): Promise<ApiResponse<Availability[]>> {
    return apiService.put<Availability[]>(`/service-agents/${serviceAgentId}/availability`, availability);
  }

  /**
   * Get service agent unavailability
   */
  async getServiceAgentUnavailability(
    serviceAgentId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<Unavailability[]>> {
    return apiService.get<Unavailability[]>(`/service-agents/${serviceAgentId}/unavailability`, {
      filter: {
        startDate,
        endDate
      }
    });
  }

  /**
   * Add service agent unavailability
   */
  async addServiceAgentUnavailability(
    serviceAgentId: string,
    unavailability: Omit<Unavailability, 'id' | 'serviceAgentId' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<Unavailability>> {
    return apiService.post<Unavailability>(`/service-agents/${serviceAgentId}/unavailability`, unavailability);
  }

  /**
   * Remove service agent unavailability
   */
  async removeServiceAgentUnavailability(
    serviceAgentId: string,
    unavailabilityId: string
  ): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/service-agents/${serviceAgentId}/unavailability/${unavailabilityId}`);
  }

  /**
   * Get client bookings
   */
  async getClientBookings(
    clientId: string,
    params?: QueryParams
  ): Promise<ApiResponse<PaginatedResult<Booking>>> {
    return apiService.get<PaginatedResult<Booking>>(`/clients/${clientId}/bookings`, params);
  }

  /**
   * Get service agent bookings
   */
  async getServiceAgentBookings(
    serviceAgentId: string,
    params?: QueryParams
  ): Promise<ApiResponse<PaginatedResult<Booking>>> {
    return apiService.get<PaginatedResult<Booking>>(`/service-agents/${serviceAgentId}/bookings`, params);
  }

  /**
   * Submit booking review
   */
  async submitBookingReview(
    bookingId: string,
    rating: number,
    comment?: string
  ): Promise<ApiResponse<any>> {
    return apiService.post<any>(`${this.baseEndpoint}/${bookingId}/reviews`, {
      rating,
      comment
    });
  }
}

// Create and export a singleton instance
export const bookingService = new BookingService();
