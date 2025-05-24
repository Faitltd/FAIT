import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

interface DateTimeStepProps {
  bookingData: any;
  updateBookingData: (step: string, data: any) => void;
  service: any;
}

const DateTimeStep: React.FC<DateTimeStepProps> = ({ 
  bookingData, 
  updateBookingData, 
  service 
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(bookingData.date || '');
  const [selectedTime, setSelectedTime] = useState<string>(bookingData.time || '');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Generate available dates (next 14 days)
  useEffect(() => {
    const dates = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return date.toISOString().split('T')[0];
    });
    
    setAvailableDates(dates);
  }, []);
  
  // Generate available time slots
  useEffect(() => {
    if (selectedDate) {
      // In a real app, this would fetch available time slots from the backend
      // based on the service provider's availability
      const timeSlots = [
        '09:00', '10:00', '11:00', '12:00', '13:00', 
        '14:00', '15:00', '16:00', '17:00'
      ];
      
      setAvailableTimeSlots(timeSlots);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate]);
  
  // Update booking data when selections change
  useEffect(() => {
    if (selectedDate && selectedTime) {
      updateBookingData('date', selectedDate);
      updateBookingData('time', selectedTime);
    }
  }, [selectedDate, selectedTime, updateBookingData]);
  
  // Handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
    setError(null);
  };
  
  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setError(null);
  };
  
  // Format date for display
  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      month: date.toLocaleDateString('en-US', { month: 'short' })
    };
  };
  
  // Format time for display
  const formatTimeDisplay = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Select Date & Time</h2>
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}
      
      {/* Date Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          Select Date
        </label>
        
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
          {availableDates.map(date => {
            const { day, weekday, month } = formatDateDisplay(date);
            const isSelected = date === selectedDate;
            
            return (
              <motion.button
                key={date}
                onClick={() => handleDateSelect(date)}
                className={`p-3 rounded-md text-center transition-colors ${
                  isSelected
                    ? 'bg-company-lightpink text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-xs">{weekday}</div>
                <div className="font-medium text-lg">{day}</div>
                <div className="text-xs">{month}</div>
              </motion.button>
            );
          })}
        </div>
      </div>
      
      {/* Time Selection */}
      {selectedDate && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Select Time
          </label>
          
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {availableTimeSlots.map(time => {
              const isSelected = time === selectedTime;
              
              return (
                <motion.button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className={`py-3 px-4 rounded-md text-center transition-colors ${
                    isSelected
                      ? 'bg-company-lightpink text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {formatTimeDisplay(time)}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Selected Date & Time Summary */}
      {selectedDate && selectedTime && (
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="font-medium text-blue-800 mb-2">Your Selected Appointment</h3>
          <div className="flex items-center text-blue-700">
            <Calendar className="h-5 w-5 mr-2" />
            <span>
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center text-blue-700 mt-1">
            <Clock className="h-5 w-5 mr-2" />
            <span>{formatTimeDisplay(selectedTime)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimeStep;
