import { supabase } from '../lib/supabaseClient';
import { 
  Booking, 
  BookingFormData, 
  BookingStatus, 
  PaymentStatus,
  BookingCancellationData,
  BookingReschedulingData,
  RecurringBookingOptions,
  TimeSlot,
  DayAvailability,
  UnavailableDate
} from '../types/booking';
import { format, addWeeks, addMonths } from 'date-fns';

/**
 * Service for booking-related operations
 */
export class BookingService {
  /**
   * Get bookings for a client
   * @param clientId - The client ID
   * @returns Promise with bookings data
   */
  async getClientBookings(clientId: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service_agent:profiles!bookings_service_agent_id_fkey(id, full_name, avatar_url),
          service_package:service_packages(id, title, price, duration, duration_unit)
        `)
        .eq('client_id', clientId)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return data as Booking[];
    } catch (error) {
      console.error('Error fetching client bookings:', error);
      throw error;
    }
  }

  /**
   * Get bookings for a service agent
   * @param serviceAgentId - The service agent ID
   * @returns Promise with bookings data
   */
  async getServiceAgentBookings(serviceAgentId: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          client:profiles!bookings_client_id_fkey(id, full_name, avatar_url),
          service_package:service_packages(id, title, price, duration, duration_unit)
        `)
        .eq('service_agent_id', serviceAgentId)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return data as Booking[];
    } catch (error) {
      console.error('Error fetching service agent bookings:', error);
      throw error;
    }
  }

  /**
   * Get a booking by ID
   * @param bookingId - The booking ID
   * @returns Promise with booking data
   */
  async getBookingById(bookingId: string): Promise<Booking> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          client:profiles!bookings_client_id_fkey(id, full_name, avatar_url, email, phone),
          service_agent:profiles!bookings_service_agent_id_fkey(id, full_name, avatar_url, email, phone),
          service_package:service_packages(*)
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      return data as Booking;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  }

  /**
   * Create a new booking
   * @param bookingData - The booking data
   * @returns Promise with created booking
   */
  async createBooking(bookingData: BookingFormData): Promise<Booking> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get service package details to get service agent ID
      const { data: servicePackage, error: packageError } = await supabase
        .from('service_packages')
        .select('service_agent_id')
        .eq('id', bookingData.service_package_id)
        .single();

      if (packageError) throw packageError;

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          client_id: user.id,
          service_agent_id: servicePackage.service_agent_id,
          service_package_id: bookingData.service_package_id,
          scheduled_date: bookingData.scheduled_date,
          scheduled_time: bookingData.scheduled_time,
          status: 'pending' as BookingStatus,
          address: bookingData.address,
          city: bookingData.city,
          state: bookingData.state,
          zip_code: bookingData.zip_code,
          notes: bookingData.notes,
          price: bookingData.total_amount,
          payment_status: 'unpaid' as PaymentStatus,
          is_recurring: false
        })
        .select()
        .single();

      if (error) throw error;
      return data as Booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  /**
   * Create recurring bookings
   * @param bookingData - The booking data
   * @param recurringOptions - The recurring booking options
   * @returns Promise with created bookings
   */
  async createRecurringBookings(
    bookingData: BookingFormData, 
    recurringOptions: RecurringBookingOptions
  ): Promise<Booking[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get service package details to get service agent ID
      const { data: servicePackage, error: packageError } = await supabase
        .from('service_packages')
        .select('service_agent_id')
        .eq('id', bookingData.service_package_id)
        .single();

      if (packageError) throw packageError;

      // Calculate future dates based on recurrence type
      const dates = this.calculateFutureDates(
        bookingData.scheduled_date,
        recurringOptions.recurrence_type,
        recurringOptions.occurrences
      );

      // Generate a recurrence group ID
      const recurrenceGroup = crypto.randomUUID();

      // Create booking objects for each date
      const bookings = dates.map((date, index) => ({
        client_id: user.id,
        service_agent_id: servicePackage.service_agent_id,
        service_package_id: bookingData.service_package_id,
        scheduled_date: date,
        scheduled_time: bookingData.scheduled_time,
        status: 'pending' as BookingStatus,
        address: bookingData.address,
        city: bookingData.city,
        state: bookingData.state,
        zip_code: bookingData.zip_code,
        notes: bookingData.notes,
        price: bookingData.total_amount,
        payment_status: 'unpaid' as PaymentStatus,
        is_recurring: true,
        recurrence_group: recurrenceGroup,
        recurrence_sequence: index + 1
      }));

      // Insert all bookings
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookings)
        .select();

      if (error) throw error;
      return data as Booking[];
    } catch (error) {
      console.error('Error creating recurring bookings:', error);
      throw error;
    }
  }

  /**
   * Update a booking
   * @param bookingId - The booking ID
   * @param bookingData - The booking data to update
   * @returns Promise with updated booking
   */
  async updateBooking(bookingId: string, bookingData: Partial<Booking>): Promise<Booking> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update(bookingData)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return data as Booking;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  /**
   * Cancel a booking
   * @param cancellationData - The cancellation data
   * @returns Promise with cancelled booking
   */
  async cancelBooking(cancellationData: BookingCancellationData): Promise<Booking> {
    try {
      // Get booking details to calculate refund
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('price, payment_status, payment_intent_id')
        .eq('id', cancellationData.booking_id)
        .single();

      if (bookingError) throw bookingError;

      // Calculate refund amount if not provided
      const refundAmount = cancellationData.refund_amount ?? this.calculateRefundAmount(booking);

      // Update booking status
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled' as BookingStatus,
          cancellation_reason: cancellationData.cancellation_reason,
          cancelled_at: new Date().toISOString(),
          refund_amount: refundAmount > 0 ? refundAmount : null
        })
        .eq('id', cancellationData.booking_id)
        .select()
        .single();

      if (error) throw error;

      // Process refund if payment was made and refund is eligible
      if (booking.payment_status === 'paid' && refundAmount > 0 && booking.payment_intent_id) {
        await this.processRefund(cancellationData.booking_id, booking.payment_intent_id, refundAmount);
      }

      return data as Booking;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  /**
   * Reschedule a booking
   * @param reschedulingData - The rescheduling data
   * @returns Promise with rescheduled booking
   */
  async rescheduleBooking(reschedulingData: BookingReschedulingData): Promise<Booking> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          scheduled_date: reschedulingData.new_scheduled_date,
          scheduled_time: reschedulingData.new_scheduled_time,
          updated_at: new Date().toISOString()
        })
        .eq('id', reschedulingData.booking_id)
        .select()
        .single();

      if (error) throw error;
      return data as Booking;
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      throw error;
    }
  }

  /**
   * Complete a booking
   * @param bookingId - The booking ID
   * @returns Promise with completed booking
   */
  async completeBooking(bookingId: string): Promise<Booking> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'completed' as BookingStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return data as Booking;
    } catch (error) {
      console.error('Error completing booking:', error);
      throw error;
    }
  }

  /**
   * Get available time slots for a service agent on a specific date
   * @param serviceAgentId - The service agent ID
   * @param date - The date to check
   * @returns Promise with available time slots
   */
  async getAvailableTimeSlots(serviceAgentId: string, date: string): Promise<TimeSlot[]> {
    try {
      // Call the Edge Function to get available slots
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/available-slots?serviceAgentId=${serviceAgentId}&startDate=${date}&endDate=${date}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch available time slots');
      }
      
      const data = await response.json();
      return data as TimeSlot[];
    } catch (error) {
      console.error('Error getting available time slots:', error);
      
      // Fall back to mock data if the function fails
      return this.getMockAvailableTimeSlots(serviceAgentId, date);
    }
  }

  /**
   * Get weekly availability for a service agent
   * @param serviceAgentId - The service agent ID
   * @returns Promise with weekly availability
   */
  async getWeeklyAvailability(serviceAgentId: string): Promise<DayAvailability[]> {
    try {
      const { data, error } = await supabase
        .from('service_agent_availability')
        .select('*')
        .eq('service_agent_id', serviceAgentId)
        .order('day_of_week');

      if (error) throw error;
      
      // Transform data into DayAvailability format
      const weeklyAvailability: DayAvailability[] = data.map(item => ({
        day_of_week: item.day_of_week,
        time_slots: this.parseTimeSlots(item.start_time, item.end_time)
      }));

      return weeklyAvailability;
    } catch (error) {
      console.error('Error getting weekly availability:', error);
      throw error;
    }
  }

  /**
   * Get unavailable dates for a service agent
   * @param serviceAgentId - The service agent ID
   * @returns Promise with unavailable dates
   */
  async getUnavailableDates(serviceAgentId: string): Promise<UnavailableDate[]> {
    try {
      const { data, error } = await supabase
        .from('service_agent_unavailable_dates')
        .select('*')
        .eq('service_agent_id', serviceAgentId)
        .gte('date', new Date().toISOString().split('T')[0]);

      if (error) throw error;
      return data as UnavailableDate[];
    } catch (error) {
      console.error('Error getting unavailable dates:', error);
      throw error;
    }
  }

  /**
   * Check if a service agent is available at a specific date and time
   * @param serviceAgentId - The service agent ID
   * @param date - The date to check
   * @param startTime - The start time to check
   * @param endTime - The end time to check
   * @returns Promise with availability status
   */
  async checkAvailability(
    serviceAgentId: string, 
    date: string, 
    startTime: string, 
    endTime: string
  ): Promise<boolean> {
    try {
      // Call the database function to check availability
      const { data, error } = await supabase.rpc('check_service_agent_availability', {
        p_service_agent_id: serviceAgentId,
        p_service_date: date,
        p_start_time: startTime,
        p_end_time: endTime
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }

  /**
   * Process a refund for a booking
   * @param bookingId - The booking ID
   * @param paymentIntentId - The payment intent ID
   * @param amount - The refund amount
   * @returns Promise with refund result
   */
  private async processRefund(
    bookingId: string, 
    paymentIntentId: string, 
    amount: number
  ): Promise<any> {
    try {
      // Get the session for authentication
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Authentication session expired');
      }

      // Call the Stripe refund function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-refund`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ paymentId: paymentIntentId, amount })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process refund');
      }

      const data = await response.json();

      // Update booking payment status
      await supabase
        .from('bookings')
        .update({
          payment_status: 'refunded' as PaymentStatus,
          refund_id: data.refund_id
        })
        .eq('id', bookingId);

      return data;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  /**
   * Calculate refund amount based on booking details
   * @param booking - The booking data
   * @returns The refund amount
   */
  private calculateRefundAmount(booking: any): number {
    // Default to full refund
    return booking.price;
  }

  /**
   * Calculate future dates for recurring bookings
   * @param startDate - The start date
   * @param recurrenceType - The recurrence type
   * @param occurrences - The number of occurrences
   * @returns Array of date strings
   */
  private calculateFutureDates(
    startDate: string, 
    recurrenceType: string, 
    occurrences: number
  ): string[] {
    const dates: string[] = [startDate];
    const startDateObj = new Date(startDate);

    for (let i = 1; i < occurrences; i++) {
      let nextDate: Date;

      if (recurrenceType === 'weekly') {
        nextDate = addWeeks(startDateObj, i);
      } else if (recurrenceType === 'biweekly') {
        nextDate = addWeeks(startDateObj, i * 2);
      } else { // monthly
        nextDate = addMonths(startDateObj, i);
      }

      dates.push(format(nextDate, 'yyyy-MM-dd'));
    }

    return dates;
  }

  /**
   * Parse time slots from start and end times
   * @param startTime - The start time
   * @param endTime - The end time
   * @returns Array of time slots
   */
  private parseTimeSlots(startTime: string, endTime: string): TimeSlot[] {
    // This is a simplified implementation
    // In a real implementation, you would parse the time range into hourly slots
    return [{
      start_time: startTime,
      end_time: endTime,
      is_available: true
    }];
  }

  /**
   * Get mock available time slots for testing
   * @param serviceAgentId - The service agent ID
   * @param date - The date to check
   * @returns Array of time slots
   */
  private getMockAvailableTimeSlots(serviceAgentId: string, date: string): TimeSlot[] {
    // Generate mock time slots for testing
    const timeSlots: TimeSlot[] = [];
    const hours = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
    
    for (const hour of hours) {
      // Make some slots unavailable randomly
      const isAvailable = Math.random() > 0.3;
      
      timeSlots.push({
        start_time: hour,
        end_time: `${parseInt(hour.split(':')[0]) + 1}:00`,
        is_available: isAvailable
      });
    }
    
    return timeSlots;
  }
}

// Export a singleton instance
export const bookingService = new BookingService();
