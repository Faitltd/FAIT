import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import EnhancedBookingWizard from '../components/booking/EnhancedBookingWizard';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Booking Test Page
 * 
 * A test page for the booking system.
 */
const BookingTest: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  
  // Handle booking completion
  const handleBookingComplete = (id: string) => {
    setBookingComplete(true);
    setBookingId(id);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-red-50 border border-red-200 rounded-lg mt-8">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }
  
  if (bookingComplete) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-green-50 border border-green-200 rounded-lg mt-8">
        <h2 className="text-xl font-semibold text-green-800 mb-2">Booking Complete!</h2>
        <p className="text-green-700">
          Your booking has been confirmed. Booking ID: {bookingId}
        </p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Book a Service</h1>
      
      <EnhancedBookingWizard
        servicePackageId={serviceId || '1'}
        onComplete={handleBookingComplete}
      />
    </div>
  );
};

export default BookingTest;
