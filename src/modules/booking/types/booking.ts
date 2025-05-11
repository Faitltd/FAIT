import { Status, User, Location } from '../../core/types/common';

/**
 * Booking status
 */
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled'
}

/**
 * Booking interface
 */
export interface Booking {
  id: string;
  serviceId: string;
  clientId: string;
  client?: User;
  serviceAgentId?: string;
  serviceAgent?: User;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  location: Location;
  notes?: string;
  specialInstructions?: string;
  estimatedPrice?: number;
  finalPrice?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Availability time slot
 */
export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
  serviceAgentId: string;
}

/**
 * Service agent availability
 */
export interface Availability {
  id: string;
  serviceAgentId: string;
  dayOfWeek: number; // 0-6, where 0 is Sunday
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service agent unavailability (exceptions to regular availability)
 */
export interface Unavailability {
  id: string;
  serviceAgentId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  isAllDay: boolean;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Booking confirmation
 */
export interface BookingConfirmation {
  bookingId: string;
  confirmationCode: string;
  confirmedAt: string;
  confirmedBy: string;
  emailSent: boolean;
  smsSent: boolean;
}

/**
 * Booking cancellation
 */
export interface BookingCancellation {
  bookingId: string;
  cancelledAt: string;
  cancelledBy: string;
  reason?: string;
  refundAmount?: number;
  refundProcessed: boolean;
}

/**
 * Booking reschedule
 */
export interface BookingReschedule {
  bookingId: string;
  previousDate: string;
  previousStartTime: string;
  previousEndTime: string;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  rescheduledAt: string;
  rescheduledBy: string;
  reason?: string;
}

/**
 * Booking review
 */
export interface BookingReview {
  id: string;
  bookingId: string;
  clientId: string;
  serviceAgentId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Booking form data
 */
export interface BookingFormData {
  serviceId: string;
  date: string;
  startTime: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
  specialInstructions?: string;
}
