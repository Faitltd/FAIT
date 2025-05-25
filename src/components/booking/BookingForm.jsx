import React, { useState, useEffect } from 'react';
import supabase from '../../utils/supabaseClient';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Using singleton Supabase client;

const BookingForm = ({ service, onSubmit, getAvailableTimeSlots }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  // Get user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          setUserProfile(profile);

          // Pre-fill address and zip code if available
          if (profile) {
            if (profile.address) setAddress(profile.address);
            if (profile.zip_code) setZipCode(profile.zip_code);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  // Initialize with tomorrow's date and check availability
  useEffect(() => {
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    setDate(tomorrowStr);
    checkAvailability(tomorrowStr);
  }, []);

  // Check availability when date changes
  const checkAvailability = async (selectedDate) => {
    try {
      setLoading(true);

      // Get available time slots for the selected date
      const times = await getAvailableTimeSlots(selectedDate);
      setAvailableTimes(times);

      // Clear selected time if it's no longer available
      if (time && !times.includes(time)) {
        setTime('');
      }

      setError(null);
    } catch (err) {
      console.error('Error checking availability:', err);
      setError('Failed to load available times. Please try again.');
      setAvailableTimes([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle date change
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    checkAvailability(selectedDate);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!date || !time) {
      setError('Please select a date and time');
      return;
    }

    if (!address || !zipCode) {
      setError('Please provide your address and ZIP code');
      return;
    }

    // Validate ZIP code format
    const zipCodeRegex = /^\d{5}(-\d{4})?$/;
    if (!zipCodeRegex.test(zipCode)) {
      setError('Please enter a valid 5-digit ZIP code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Submit booking
      const result = await onSubmit({
        date,
        time,
        notes,
        address,
        zipCode
      });

      if (result && !result.success) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error submitting booking:', err);
      setError('Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format time for display
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Book This Service</h3>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Date Selection */}
        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            min={today}
            value={date}
            onChange={handleDateChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        {/* Time Selection */}
        <div className="mb-4">
          <label htmlFor="time" className="block text-sm font-medium text-gray-700">
            Time
          </label>
          {loading ? (
            <div className="mt-1 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
              <span className="text-sm text-gray-500">Loading available times...</span>
            </div>
          ) : availableTimes.length === 0 ? (
            <div className="mt-1 text-sm text-red-500">
              No available times on this date. Please select another date.
            </div>
          ) : (
            <select
              id="time"
              name="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select a time</option>
              {availableTimes.map((timeSlot) => (
                <option key={timeSlot} value={timeSlot}>
                  {formatTime(timeSlot)}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Address */}
        <div className="mb-4">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Service Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter your address"
            required
          />
        </div>

        {/* ZIP Code */}
        <div className="mb-4">
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
            ZIP Code
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter ZIP code"
            required
          />
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Add any special instructions or details"
          />
        </div>

        {/* Price Summary */}
        <div className="mb-6 bg-white p-4 rounded-md border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Service Price</span>
            <span className="text-sm font-medium text-gray-900">${service.price.toFixed(2)}</span>
          </div>
          {service.tax_rate && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">Tax ({service.tax_rate}%)</span>
              <span className="text-sm text-gray-500">
                ${((service.price * service.tax_rate) / 100).toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
            <span className="text-base font-medium text-gray-900">Total</span>
            <span className="text-base font-medium text-gray-900">
              ${service.tax_rate
                ? (service.price + (service.price * service.tax_rate) / 100).toFixed(2)
                : service.price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || availableTimes.length === 0}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            'Book Now'
          )}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
