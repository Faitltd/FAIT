import React, { useState, useEffect } from 'react';
import { format, addDays, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns';
import { Calendar, Clock, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { TimeSlot } from '../../types/booking';
import LoadingSpinner from '../LoadingSpinner';

interface DateTimeSelectionProps {
  serviceAgentId: string;
  serviceId: string;
  duration: number;
  onSelectDateTime: (date: string, time: string) => void;
  selectedDate: string;
  selectedTime: string;
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({
  serviceAgentId,
  serviceId,
  duration,
  onSelectDateTime,
  selectedDate,
  selectedTime
}) => {
  // State for calendar view
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewDate, setViewDate] = useState<Date | null>(selectedDate ? parseISO(selectedDate) : null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch unavailable dates when component mounts
  useEffect(() => {
    const fetchUnavailableDates = async () => {
      try {
        setLoadingCalendar(true);
        const dates = await bookingService.getUnavailableDates(serviceAgentId);
        setUnavailableDates(dates.map(d => d.date));
      } catch (err) {
        console.error('Error fetching unavailable dates:', err);
        setError('Failed to load calendar availability');
      } finally {
        setLoadingCalendar(false);
      }
    };

    fetchUnavailableDates();
  }, [serviceAgentId]);

  // Fetch time slots when date changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!viewDate) return;

      try {
        setLoadingTimeSlots(true);
        const formattedDate = format(viewDate, 'yyyy-MM-dd');
        const slots = await bookingService.getAvailableTimeSlots(serviceAgentId, formattedDate);
        setTimeSlots(slots);
      } catch (err) {
        console.error('Error fetching time slots:', err);
        setError('Failed to load available time slots');
      } finally {
        setLoadingTimeSlots(false);
      }
    };

    fetchTimeSlots();
  }, [serviceAgentId, viewDate]);

  // Handle month navigation
  const prevMonth = () => {
    setCurrentMonth(prev => addMonths(prev, -1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Check if date is unavailable
    if (unavailableDates.includes(formattedDate)) {
      return;
    }
    
    setViewDate(date);
    onSelectDateTime(formattedDate, selectedTime);
  };

  // Handle time selection
  const handleTimeSelect = (timeSlot: TimeSlot) => {
    if (!timeSlot.is_available) return;
    
    onSelectDateTime(
      viewDate ? format(viewDate, 'yyyy-MM-dd') : '',
      timeSlot.start_time
    );
  };

  // Render calendar
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = monthStart;
    const endDate = monthEnd;

    const dateFormat = 'MMMM yyyy';
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="calendar">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            {format(currentMonth, dateFormat)}
          </h2>
          <button
            type="button"
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: getDay(monthStart) }).map((_, index) => (
            <div key={`empty-${index}`} className="h-10" />
          ))}

          {days.map(day => {
            const formattedDate = format(day, 'yyyy-MM-dd');
            const isUnavailable = unavailableDates.includes(formattedDate);
            const isSelected = viewDate && isSameDay(day, viewDate);
            const isCurrentDay = isToday(day);
            const isDisabled = day < new Date() || isUnavailable;

            return (
              <button
                key={day.toString()}
                type="button"
                onClick={() => !isDisabled && handleDateSelect(day)}
                disabled={isDisabled}
                className={`
                  h-10 w-full rounded-md flex items-center justify-center text-sm
                  ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                  ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                  ${isCurrentDay && !isSelected ? 'border border-blue-500' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render time slots
  const renderTimeSlots = () => {
    if (!viewDate) {
      return (
        <div className="text-center py-8 text-gray-500">
          Please select a date to view available time slots
        </div>
      );
    }

    if (loadingTimeSlots) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <LoadingSpinner />
          <p className="mt-2 text-gray-600">Loading available times...</p>
        </div>
      );
    }

    if (timeSlots.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No available time slots for this date
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-2 mt-4">
        {timeSlots.map((slot, index) => (
          <button
            key={index}
            type="button"
            disabled={!slot.is_available}
            onClick={() => handleTimeSelect(slot)}
            className={`
              py-2 px-4 rounded-md text-sm font-medium
              ${!slot.is_available 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : slot.start_time === selectedTime && viewDate && format(viewDate, 'yyyy-MM-dd') === selectedDate
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {formatTime(slot.start_time)}
          </button>
        ))}
      </div>
    );
  };

  // Helper function to get day of week (0-6)
  const getDay = (date: Date) => {
    const day = date.getDay();
    return day;
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loadingCalendar) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <LoadingSpinner />
        <p className="mt-2 text-gray-600">Loading calendar...</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Date and Time</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 flex items-start">
          <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center mb-2">
            <Calendar size={18} className="text-gray-500 mr-2" />
            <h4 className="text-md font-medium text-gray-700">Select Date</h4>
          </div>
          {renderCalendar()}
        </div>
        
        <div>
          <div className="flex items-center mb-2">
            <Clock size={18} className="text-gray-500 mr-2" />
            <h4 className="text-md font-medium text-gray-700">Select Time</h4>
          </div>
          {renderTimeSlots()}
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelection;
