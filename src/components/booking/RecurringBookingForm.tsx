import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, Repeat, AlertCircle, CheckCircle, Info } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import { addDays, addWeeks, addMonths, format } from 'date-fns';

interface RecurringBookingFormProps {
  servicePackageId: string;
  serviceAgentId: string;
  initialDate: string;
  initialTime: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  onSuccess: (bookingIds: string[]) => void;
  onCancel: () => void;
}

const RecurringBookingForm: React.FC<RecurringBookingFormProps> = ({
  servicePackageId,
  serviceAgentId,
  initialDate,
  initialTime,
  price,
  address,
  city,
  state,
  zipCode,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [recurrenceType, setRecurrenceType] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [occurrences, setOccurrences] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bookingIds, setBookingIds] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDates, setPreviewDates] = useState<string[]>([]);
  
  // Calculate future dates based on recurrence type and occurrences
  const calculateFutureDates = () => {
    const startDate = new Date(initialDate);
    const dates: string[] = [format(startDate, 'yyyy-MM-dd')];
    
    for (let i = 1; i < occurrences; i++) {
      let nextDate: Date;
      
      if (recurrenceType === 'weekly') {
        nextDate = addWeeks(startDate, i);
      } else if (recurrenceType === 'biweekly') {
        nextDate = addWeeks(startDate, i * 2);
      } else { // monthly
        nextDate = addMonths(startDate, i);
      }
      
      dates.push(format(nextDate, 'yyyy-MM-dd'));
    }
    
    return dates;
  };
  
  // Show preview of recurring dates
  const handleShowPreview = () => {
    const dates = calculateFutureDates();
    setPreviewDates(dates);
    setShowPreview(true);
  };
  
  // Create recurring bookings
  const handleCreateRecurringBookings = async () => {
    if (!user) {
      setError('You must be logged in to book a service');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const dates = calculateFutureDates();
      const bookings = dates.map(date => ({
        client_id: user.id,
        service_agent_id: serviceAgentId,
        service_package_id: servicePackageId,
        scheduled_date: date,
        scheduled_time: initialTime,
        status: 'pending',
        address,
        city,
        state,
        zip_code: zipCode,
        price,
        payment_status: 'pending',
        is_recurring: true,
        recurrence_group: crypto.randomUUID() // Generate a UUID to group recurring bookings
      }));
      
      // Insert all bookings
      const { data, error: insertError } = await supabase
        .from('bookings')
        .insert(bookings)
        .select('id');
      
      if (insertError) throw insertError;
      
      // Extract booking IDs
      const ids = data?.map(booking => booking.id) || [];
      setBookingIds(ids);
      
      // Create payment intent for the first booking
      if (ids.length > 0) {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            booking_id: ids[0],
            amount: price,
            is_recurring: true,
            recurrence_count: occurrences
          }),
        });
        
        const paymentData = await response.json();
        
        if (paymentData.error) {
          throw new Error(paymentData.error);
        }
      }
      
      setSuccess(true);
      onSuccess(ids);
    } catch (err) {
      console.error('Error creating recurring bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to create recurring bookings');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (success) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Recurring Bookings Created!</h2>
          <p className="text-gray-600 mb-6">
            Your recurring bookings have been created successfully. You will receive confirmation emails for each booking.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Set Up Recurring Booking</h2>
      <p className="text-gray-600 mb-6">
        Schedule this service to repeat automatically
      </p>
      
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 flex items-start">
        <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-blue-700">Initial Booking Details</h4>
          <p className="text-sm text-blue-600">
            {formatDate(initialDate)} at {initialTime}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            {address}, {city}, {state} {zipCode}
          </p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recurrence Pattern
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setRecurrenceType('weekly')}
              className={`py-2 px-3 text-sm font-medium rounded-md ${
                recurrenceType === 'weekly'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } border`}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => setRecurrenceType('biweekly')}
              className={`py-2 px-3 text-sm font-medium rounded-md ${
                recurrenceType === 'biweekly'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } border`}
            >
              Bi-weekly
            </button>
            <button
              type="button"
              onClick={() => setRecurrenceType('monthly')}
              className={`py-2 px-3 text-sm font-medium rounded-md ${
                recurrenceType === 'monthly'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } border`}
            >
              Monthly
            </button>
          </div>
        </div>
        
        <div>
          <label htmlFor="occurrences" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Occurrences
          </label>
          <select
            id="occurrences"
            value={occurrences}
            onChange={(e) => setOccurrences(parseInt(e.target.value))}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {[2, 3, 4, 5, 6, 8, 10, 12].map(num => (
              <option key={num} value={num}>{num} bookings</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-700">Total Price:</span>
            <span className="ml-2 text-lg font-semibold text-gray-900">{formatCurrency(price * occurrences)}</span>
          </div>
          
          <button
            type="button"
            onClick={handleShowPreview}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Preview Dates
          </button>
        </div>
        
        {showPreview && (
          <div className="p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Scheduled Dates</h4>
            <ul className="space-y-2">
              {previewDates.map((date, index) => (
                <li key={index} className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">
                    {formatDate(date)} at {initialTime}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-yellow-800 flex items-center">
            <Info className="h-4 w-4 mr-1" />
            Important Information
          </h4>
          <ul className="mt-2 text-xs text-yellow-700 list-disc list-inside space-y-1">
            <li>You will be charged for the first booking now</li>
            <li>Future bookings will be charged automatically 24 hours before each appointment</li>
            <li>You can cancel any future booking up to 24 hours before the appointment for a full refund</li>
            <li>Recurring bookings are subject to service agent availability</li>
          </ul>
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleCreateRecurringBookings}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Repeat className="h-4 w-4 mr-2" />
                Create Recurring Bookings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecurringBookingForm;
