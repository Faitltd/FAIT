import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

interface BookingCancellationModalProps {
  bookingId: string;
  bookingDate: string;
  bookingTime: string;
  isOpen: boolean;
  onClose: () => void;
  onCancellationComplete: () => void;
}

const BookingCancellationModal: React.FC<BookingCancellationModalProps> = ({
  bookingId,
  bookingDate,
  bookingTime,
  isOpen,
  onClose,
  onCancellationComplete
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number | null>(null);

  // Calculate if the booking is eligible for a refund
  const calculateRefundEligibility = () => {
    const now = new Date();
    const appointmentDate = new Date(`${bookingDate}T${bookingTime}`);
    const hoursDifference = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // More than 24 hours before appointment: 100% refund
    if (hoursDifference > 24) {
      return 1.0;
    }
    // Between 12 and 24 hours: 50% refund
    else if (hoursDifference > 12) {
      return 0.5;
    }
    // Less than 12 hours: no refund
    else {
      return 0;
    }
  };

  const handleCancelBooking = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get booking details to calculate refund
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('price, payment_status, payment_intent_id')
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;

      // Calculate refund amount
      const refundPercentage = calculateRefundEligibility();
      const calculatedRefundAmount = booking.price * refundPercentage;
      setRefundAmount(calculatedRefundAmount);

      // Update booking status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
          refund_amount: calculatedRefundAmount > 0 ? calculatedRefundAmount : null
        })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Process refund if payment was made and refund is eligible
      if (booking.payment_status === 'paid' && calculatedRefundAmount > 0 && booking.payment_intent_id) {
        // Call refund API endpoint
        const response = await fetch('/api/process-refund', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            booking_id: bookingId,
            payment_intent_id: booking.payment_intent_id,
            amount: calculatedRefundAmount
          }),
        });

        const refundData = await response.json();
        
        if (!response.ok) {
          throw new Error(refundData.error || 'Failed to process refund');
        }

        // Update payment status
        await supabase
          .from('bookings')
          .update({
            payment_status: 'refunded',
            refund_id: refundData.refund_id
          })
          .eq('id', bookingId);
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        onCancellationComplete();
      }, 3000);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            {success ? (
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 text-center">
                  Booking Cancelled Successfully
                </h3>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    Your booking has been cancelled.
                  </p>
                  {refundAmount !== null && refundAmount > 0 && (
                    <p className="mt-2 text-sm text-green-600">
                      A refund of ${refundAmount.toFixed(2)} has been processed and will be credited to your original payment method.
                    </p>
                  )}
                  {refundAmount !== null && refundAmount === 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      No refund will be issued as the cancellation was made too close to the appointment time.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Cancel Booking
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to cancel this booking? This action cannot be undone.
                    </p>
                    
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <h4 className="text-sm font-medium text-yellow-800">Refund Policy</h4>
                      <ul className="mt-2 text-xs text-yellow-700 list-disc list-inside">
                        <li>Cancellations more than 24 hours before the appointment: 100% refund</li>
                        <li>Cancellations between 12-24 hours before the appointment: 50% refund</li>
                        <li>Cancellations less than 12 hours before the appointment: No refund</li>
                      </ul>
                    </div>
                    
                    <div className="mt-4">
                      <label htmlFor="cancellation-reason" className="block text-sm font-medium text-gray-700">
                        Reason for Cancellation
                      </label>
                      <textarea
                        id="cancellation-reason"
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Please provide a reason for cancellation"
                      />
                    </div>
                    
                    {error && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          
          {!success && (
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  'Cancel Booking'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                Keep Booking
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCancellationModal;
