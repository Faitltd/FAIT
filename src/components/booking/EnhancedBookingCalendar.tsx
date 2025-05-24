import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import { Calendar, Clock, ChevronLeft, ChevronRight, AlertCircle, Info } from 'lucide-react';
import { useAvailability } from '../../hooks/useAvailability';
import LoadingSpinner from '../LoadingSpinner';

interface TimeSlot {
  time: string;
  available: boolean;
  duration: number;
}

interface EnhancedBookingCalendarProps {
  serviceAgentId: string;
  serviceId?: string;
  duration?: number;
  onSelectTimeSlot: (date: string, time: string) => void;
  selectedDate?: string;
  selectedTime?: string;
  minDate?: Date;
  maxDate?: Date;
}

const EnhancedBookingCalendar: React.FC<EnhancedBookingCalendarProps> = ({
  serviceAgentId,
  serviceId,
  duration = 60,
  onSelectTimeSlot,
  selectedDate,
  selectedTime,
  minDate = new Date(),
  maxDate = addDays(new Date(), 90) // Default to 90 days in the future
}) => {
  // State for calendar view
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewDate, setViewDate] = useState<Date | null>(selectedDate ? parseISO(selectedDate) : null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  
  // Use the availability hook
  const {
    loading,
    error,
    unavailableDates,
    getAvailableTimeSlots
  } = useAvailability({ serviceAgentId });

  // Handle month navigation
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Handle date selection
  const handleDateClick = (day: Date) => {
    // Don't allow selecting dates before today or after max date
    if (isBefore(day, minDate) || isAfter(day, maxDate)) {
      return;
    }
    
    setViewDate(day);
    fetchTimeSlots(day);
  };

  // Fetch time slots for a specific date
  const fetchTimeSlots = async (date: Date) => {
    setLoadingTimeSlots(true);
    
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const availableSlots = await getAvailableTimeSlots(dateStr);
      
      // Format the time slots
      const formattedSlots = availableSlots.map((slot: any) => ({
        time: slot.time,
        available: slot.available,
        duration: slot.duration || duration
      }));
      
      setTimeSlots(formattedSlots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setTimeSlots([]);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  // Check if a date is unavailable
  const isDateUnavailable = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return unavailableDates.some(d => d.date === dateStr);
  };

  // Handle time slot selection
  const handleTimeSlotClick = (time: string) => {
    if (!viewDate) return;
    
    const dateStr = format(viewDate, 'yyyy-MM-dd');
    onSelectTimeSlot(dateStr, time);
  };

  // Load time slots when selected date changes
  useEffect(() => {
    if (selectedDate) {
      const date = parseISO(selectedDate);
      setViewDate(date);
      fetchTimeSlots(date);
    }
  }, [selectedDate]);

  // Render calendar days
  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const today = new Date();

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center py-2 text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {days.map(day => {
          const isUnavailable = isDateUnavailable(day);
          const isPastDate = isBefore(day, today) && !isToday(day);
          const isFutureDate = isAfter(day, maxDate);
          const isDisabled = isPastDate || isFutureDate || isUnavailable;
          const isSelected = viewDate ? isSameDay(day, viewDate) : false;
          
          return (
            <button
              key={day.toString()}
              type="button"
              onClick={() => handleDateClick(day)}
              className={`
                h-10 rounded-md text-sm font-medium
                ${!isSameMonth(day, currentMonth) ? 'text-gray-300' : ''}
                ${isToday(day) ? 'border border-blue-500' : ''}
                ${isSelected ? 'bg-blue-100 text-blue-700' : ''}
                ${isUnavailable ? 'bg-gray-100 text-gray-400' : ''}
                ${isPastDate ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                ${isFutureDate ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                ${!isSelected && !isDisabled && isSameMonth(day, currentMonth) ? 'hover:bg-gray-100' : ''}
                ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
              disabled={isDisabled}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    );
  };

  // Format time for display
  const formatTime = (time: string) => {
    try {
      return format(parseISO(`2000-01-01T${time}`), 'h:mm a');
    } catch (e) {
      return time;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Select Date & Time</h3>
      </div>
      
      {error && (
        <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error.message}</p>
        </div>
      )}
      
      <div className="p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 rounded-md hover:bg-gray-100"
              disabled={isBefore(startOfMonth(currentMonth), startOfMonth(minDate))}
            >
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            </button>
            
            <h4 className="text-lg font-medium text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h4>
            
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 rounded-md hover:bg-gray-100"
              disabled={isAfter(startOfMonth(currentMonth), startOfMonth(maxDate))}
            >
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          {renderCalendarDays()}
        </div>
        
        {viewDate && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4">
              Available Times for {format(viewDate, 'MMMM d, yyyy')}
            </h4>
            
            {loadingTimeSlots ? (
              <div className="flex justify-center items-center h-32">
                <LoadingSpinner />
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start">
                <Info className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  No available time slots for this date. Please select another date.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {timeSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => slot.available && handleTimeSlotClick(slot.time)}
                    disabled={!slot.available}
                    className={`
                      py-2 px-3 text-sm font-medium rounded-md border
                      ${slot.available 
                        ? selectedTime === slot.time
                          ? 'bg-blue-100 text-blue-700 border-blue-300'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="flex items-center justify-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatTime(slot.time)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedBookingCalendar;
