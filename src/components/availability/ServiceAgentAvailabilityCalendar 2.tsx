import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns';
import { Calendar, Clock, Plus, X, Save, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAvailability, TimeSlot, DayAvailability } from '../../hooks/useAvailability';
import LoadingSpinner from '../LoadingSpinner';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

interface ServiceAgentAvailabilityCalendarProps {
  serviceAgentId?: string;
  readOnly?: boolean;
  onAvailabilityChange?: () => void;
}

const ServiceAgentAvailabilityCalendar: React.FC<ServiceAgentAvailabilityCalendarProps> = ({
  serviceAgentId,
  readOnly = false,
  onAvailabilityChange
}) => {
  // State for calendar view
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'weekly' | 'dates'>('weekly');
  const [selectedDay, setSelectedDay] = useState(1); // Monday by default
  
  // State for time slot editing
  const [editingTimeSlots, setEditingTimeSlots] = useState<TimeSlot[]>([]);
  const [newTimeSlot, setNewTimeSlot] = useState<{ start: string; end: string }>({ start: '09:00', end: '17:00' });
  
  // State for unavailable date management
  const [unavailableDateReason, setUnavailableDateReason] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Use the availability hook
  const {
    loading,
    saving,
    error,
    weeklyAvailability,
    unavailableDates,
    updateWeeklyAvailability,
    addUnavailableDate,
    removeUnavailableDate
  } = useAvailability({ serviceAgentId });

  // Initialize editing time slots when selected day changes
  useEffect(() => {
    if (weeklyAvailability && weeklyAvailability[selectedDay]) {
      setEditingTimeSlots([...weeklyAvailability[selectedDay].time_slots]);
    } else {
      setEditingTimeSlots([]);
    }
  }, [selectedDay, weeklyAvailability]);

  // Handle month navigation
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Handle date selection
  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setUnavailableDateReason('');
  };

  // Check if a date is unavailable
  const isDateUnavailable = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return unavailableDates.some(d => d.date === dateStr);
  };

  // Get unavailable date details
  const getUnavailableDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return unavailableDates.find(d => d.date === dateStr);
  };

  // Handle adding a time slot
  const handleAddTimeSlot = () => {
    if (newTimeSlot.start >= newTimeSlot.end) {
      alert('End time must be after start time');
      return;
    }

    // Check for overlapping time slots
    const hasOverlap = editingTimeSlots.some(slot => {
      return (
        (newTimeSlot.start >= slot.start_time && newTimeSlot.start < slot.end_time) ||
        (newTimeSlot.end > slot.start_time && newTimeSlot.end <= slot.end_time) ||
        (newTimeSlot.start <= slot.start_time && newTimeSlot.end >= slot.end_time)
      );
    });

    if (hasOverlap) {
      alert('Time slots cannot overlap');
      return;
    }

    setEditingTimeSlots([
      ...editingTimeSlots,
      { start_time: newTimeSlot.start, end_time: newTimeSlot.end }
    ]);
  };

  // Handle removing a time slot
  const handleRemoveTimeSlot = (index: number) => {
    const updatedSlots = [...editingTimeSlots];
    updatedSlots.splice(index, 1);
    setEditingTimeSlots(updatedSlots);
  };

  // Handle saving weekly availability
  const handleSaveWeeklyAvailability = async () => {
    const success = await updateWeeklyAvailability({
      day_of_week: selectedDay,
      time_slots: editingTimeSlots
    });

    if (success) {
      setSuccessMessage(`Availability for ${DAYS_OF_WEEK[selectedDay]} updated successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
      if (onAvailabilityChange) onAvailabilityChange();
    }
  };

  // Handle marking a date as unavailable
  const handleMarkUnavailable = async () => {
    if (!selectedDate) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const success = await addUnavailableDate(dateStr, unavailableDateReason);

    if (success) {
      setSuccessMessage(`${format(selectedDate, 'MMMM d, yyyy')} marked as unavailable`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setUnavailableDateReason('');
      if (onAvailabilityChange) onAvailabilityChange();
    }
  };

  // Handle removing an unavailable date
  const handleRemoveUnavailableDate = async () => {
    if (!selectedDate) return;

    const unavailableDate = getUnavailableDate(selectedDate);
    if (!unavailableDate) return;

    const success = await removeUnavailableDate(unavailableDate.id);

    if (success) {
      setSuccessMessage(`${format(selectedDate, 'MMMM d, yyyy')} is now available`);
      setTimeout(() => setSuccessMessage(''), 3000);
      if (onAvailabilityChange) onAvailabilityChange();
    }
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className="grid grid-cols-7 gap-1">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="text-center py-2 text-sm font-medium text-gray-500">
            {day.substring(0, 3)}
          </div>
        ))}
        
        {days.map(day => {
          const isUnavailable = isDateUnavailable(day);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          
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
                ${isUnavailable ? 'bg-red-100 text-red-700' : ''}
                ${!isSelected && !isUnavailable && isSameMonth(day, currentMonth) ? 'hover:bg-gray-100' : ''}
              `}
              disabled={readOnly}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    );
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
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Availability Settings</h3>
          
          {!readOnly && (
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setActiveTab('weekly')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  activeTab === 'weekly' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Weekly Schedule
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('dates')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  activeTab === 'dates' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Specific Dates
              </button>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error.message}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="m-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-start">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}
      
      <div className="p-4">
        {activeTab === 'weekly' && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Day of Week
              </label>
              <div className="grid grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(index)}
                    className={`py-2 text-center text-sm font-medium rounded-md ${
                      selectedDay === index
                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    } border`}
                    disabled={readOnly}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Available Time Slots for {DAYS_OF_WEEK[selectedDay]}
                </h4>
                
                {!readOnly && (
                  <button
                    type="button"
                    onClick={handleSaveWeeklyAvailability}
                    disabled={saving}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? (
                      <LoadingSpinner size="small" className="mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Save
                  </button>
                )}
              </div>
              
              {editingTimeSlots.length === 0 ? (
                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <p className="text-sm text-gray-500">No time slots available for this day</p>
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  {editingTimeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium">
                          {slot.start_time} - {slot.end_time}
                        </span>
                      </div>
                      
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTimeSlot(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {!readOnly && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Add Time Slot</h5>
                  <div className="flex items-center space-x-2">
                    <div>
                      <label htmlFor="start-time" className="sr-only">Start Time</label>
                      <select
                        id="start-time"
                        value={newTimeSlot.start}
                        onChange={(e) => setNewTimeSlot({ ...newTimeSlot, start: e.target.value })}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        {TIME_SLOTS.map(time => (
                          <option key={`start-${time}`} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    
                    <span className="text-gray-500">to</span>
                    
                    <div>
                      <label htmlFor="end-time" className="sr-only">End Time</label>
                      <select
                        id="end-time"
                        value={newTimeSlot.end}
                        onChange={(e) => setNewTimeSlot({ ...newTimeSlot, end: e.target.value })}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        {TIME_SLOTS.map(time => (
                          <option key={`end-${time}`} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleAddTimeSlot}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'dates' && (
          <div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-2 rounded-md hover:bg-gray-100"
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
                >
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              {renderCalendarDays()}
            </div>
            
            {selectedDate && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </h4>
                
                {isDateUnavailable(selectedDate) ? (
                  <div>
                    <div className="mb-4">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-sm font-medium text-red-700">Marked as unavailable</span>
                      </div>
                      
                      {getUnavailableDate(selectedDate)?.reason && (
                        <p className="mt-1 text-sm text-gray-500 ml-7">
                          Reason: {getUnavailableDate(selectedDate)?.reason}
                        </p>
                      )}
                    </div>
                    
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={handleRemoveUnavailableDate}
                        disabled={saving}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        {saving ? (
                          <LoadingSpinner size="small" className="mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Mark as Available
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    {!readOnly && (
                      <>
                        <div className="mb-4">
                          <label htmlFor="unavailable-reason" className="block text-sm font-medium text-gray-700 mb-1">
                            Reason (optional)
                          </label>
                          <input
                            type="text"
                            id="unavailable-reason"
                            value={unavailableDateReason}
                            onChange={(e) => setUnavailableDateReason(e.target.value)}
                            placeholder="e.g., Holiday, Personal day, etc."
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        
                        <button
                          type="button"
                          onClick={handleMarkUnavailable}
                          disabled={saving}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          {saving ? (
                            <LoadingSpinner size="small" className="mr-2" />
                          ) : (
                            <X className="h-4 w-4 mr-1" />
                          )}
                          Mark as Unavailable
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceAgentAvailabilityCalendar;
