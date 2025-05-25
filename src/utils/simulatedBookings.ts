/**
 * Utility functions for handling simulated bookings
 * This is a temporary solution until the proper database setup is in place
 */

import type { Database } from '../lib/database.types';

type Booking = Database['public']['Tables']['bookings']['Row'];
type ServicePackage = Database['public']['Tables']['service_packages']['Row'];

/**
 * Save a simulated booking to localStorage
 */
export const saveSimulatedBooking = (
  booking: {
    id: string;
    client_id: string;
    service_package_id: string;
    scheduled_date: string;
    status: string;
    total_amount: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
  },
  servicePackage: ServicePackage
) => {
  // Get existing bookings from localStorage
  const existingBookingsStr = localStorage.getItem('simulatedBookings');
  const existingBookings = existingBookingsStr ? JSON.parse(existingBookingsStr) : [];

  // Add the new booking with service package info
  const bookingWithService = {
    ...booking,
    service_package: {
      ...servicePackage,
      service_agent: {
        full_name: 'Service Agent',
        avatar_url: null
      }
    }
  };

  // Add to the beginning of the array (most recent first)
  existingBookings.unshift(bookingWithService);

  // Save back to localStorage
  localStorage.setItem('simulatedBookings', JSON.stringify(existingBookings));

  return bookingWithService;
};

/**
 * Get all simulated bookings for a user
 */
export const getSimulatedBookings = (userId: string): Booking[] => {
  const bookingsStr = localStorage.getItem('simulatedBookings');
  if (!bookingsStr) return [];

  const allBookings = JSON.parse(bookingsStr);
  return allBookings.filter((booking: Booking) => booking.client_id === userId);
};

/**
 * Clear all simulated bookings (for testing)
 */
export const clearSimulatedBookings = () => {
  localStorage.removeItem('simulatedBookings');
};
