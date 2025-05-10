/**
 * Booking system types
 */

export type BookingStatus = 
  | 'pending'     // Booking has been created but not confirmed
  | 'confirmed'   // Booking has been confirmed by the service agent
  | 'completed'   // Booking has been completed
  | 'cancelled';  // Booking has been cancelled

export type PaymentStatus = 
  | 'unpaid'      // Payment has not been made
  | 'pending'     // Payment is being processed
  | 'paid'        // Payment has been completed
  | 'failed'      // Payment has failed
  | 'refunded';   // Payment has been refunded

export type RecurrenceType = 
  | 'weekly'      // Booking repeats every week
  | 'biweekly'    // Booking repeats every two weeks
  | 'monthly';    // Booking repeats every month

/**
 * Booking interface representing a service booking
 */
export interface Booking {
  id: string;
  client_id: string;
  service_agent_id: string;
  service_package_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: BookingStatus;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  notes?: string;
  price: number;
  payment_status: PaymentStatus;
  payment_intent_id?: string;
  is_recurring: boolean;
  recurrence_group?: string;
  recurrence_sequence?: number;
  cancellation_reason?: string;
  cancelled_at?: string;
  refund_amount?: number;
  refund_id?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  client?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email?: string;
    phone?: string;
  };
  service_agent?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email?: string;
    phone?: string;
  };
  service_package?: {
    id: string;
    title: string;
    description: string;
    price: number;
    duration: number;
    duration_unit: string;
  };
}

/**
 * Time slot interface for availability
 */
export interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

/**
 * Day availability interface
 */
export interface DayAvailability {
  day_of_week: number; // 0-6 for Sunday-Saturday
  time_slots: TimeSlot[];
}

/**
 * Unavailable date interface
 */
export interface UnavailableDate {
  id: string;
  service_agent_id: string;
  date: string;
  reason?: string;
  created_at: string;
}

/**
 * Booking form data interface
 */
export interface BookingFormData {
  service_package_id: string;
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  notes?: string;
  total_amount: number;
}

/**
 * Recurring booking options interface
 */
export interface RecurringBookingOptions {
  recurrence_type: RecurrenceType;
  occurrences: number;
}

/**
 * Booking cancellation data interface
 */
export interface BookingCancellationData {
  booking_id: string;
  cancellation_reason?: string;
  refund_amount?: number;
}

/**
 * Booking rescheduling data interface
 */
export interface BookingReschedulingData {
  booking_id: string;
  new_scheduled_date: string;
  new_scheduled_time: string;
}
