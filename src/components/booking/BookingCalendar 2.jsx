import React, { useState, useEffect } from 'react';
import supabase from '../../utils/supabaseClient';;
import { getAvailableTimeSlots } from '../../api/availabilityApi';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Using singleton Supabase client;

const BookingCalendar = ({ serviceId, onSelectTimeSlot }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weekDates, setWeekDates] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));

  useEffect(() => {
    // Generate dates for the week
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(currentWeekStart, i));
    }
    setWeekDates(dates);
  }, [currentWeekStart]);

  useEffect(() => {
    if (serviceId && selectedDate) {
      fetchTimeSlots();
    }
  }, [serviceId, selectedDate]);

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      const data = await getAvailableTimeSlots(
        serviceId,
        format(selectedDate, 'yyyy-MM-dd')
      );
      setTimeSlots(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setError('Failed to load available time slots');
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const handleTimeSlotClick = (startTime, endTime) => {
    if (onSelectTimeSlot) {
      onSelectTimeSlot({
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime,
        endTime
      });
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Select Date & Time
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Choose an available time slot for your booking.
        </p>
      </div>
      
      <div className="border-t border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePreviousWeek}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="-ml-1 mr-1 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Previous Week
            </button>
            <div className="text-sm font-medium text-gray-900">
              {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
            </div>
            <button
              type="button"
              onClick={handleNextWeek}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next Week
              <svg className="ml-1 -mr-1 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Date Selection */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {weekDates.map((date) => (
              <button
                key={date.toString()}
                type="button"
                onClick={() => handleDateClick(date)}
                className={`py-2 text-center rounded-md ${
                  isSameDay(date, selectedDate)
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } border`}
              >
                <div className="text-xs font-medium">
                  {format(date, 'EEE')}
                </div>
                <div className="text-lg font-semibold">
                  {format(date, 'd')}
                </div>
              </button>
            ))}
          </div>
          
          {/* Time Slots */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">
              Available Time Slots for {format(selectedDate, 'MMMM d, yyyy')}
            </h4>
            
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="text-center py-8 px-4 bg-gray-50 rounded-md">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No available time slots</h3>
                <p className="mt-1 text-sm text-gray-500">
                  There are no available time slots for this date. Please select another date.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {timeSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    disabled={!slot.is_available}
                    onClick={() => handleTimeSlotClick(slot.start_time, slot.end_time)}
                    className={`py-2 px-3 text-sm font-medium rounded-md ${
                      slot.is_available
                        ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    } border`}
                  >
                    {format(parseISO(`2000-01-01T${slot.start_time}`), 'h:mm a')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
