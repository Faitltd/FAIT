import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Plus, X, Check, AlertCircle } from 'lucide-react';

interface Availability {
  id?: string;
  service_agent_id?: string;
  is_recurring: boolean;
  day_of_week?: number;
  start_date?: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  created_at?: string;
  updated_at?: string;
}

const ServiceAgentAvailability: React.FC = () => {
  const { user } = useAuth();
  const [isRecurring, setIsRecurring] = useState(true);
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'weekly' | 'specific'>('weekly');

  // Initialize with tomorrow's date
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setStartDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Fetch availability data
  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('service_agent_availability')
        .select('*')
        .eq('service_agent_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailabilities(data || []);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  // Load availability on component mount
  useEffect(() => {
    if (user) {
      fetchAvailability();
    }
  }, [user]);

  // Validate form inputs
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validate time inputs
    if (!startTime) {
      errors.startTime = 'Start time is required';
    }

    if (!endTime) {
      errors.endTime = 'End time is required';
    }

    if (startTime && endTime && startTime >= endTime) {
      errors.endTime = 'End time must be after start time';
    }

    // Validate date inputs for non-recurring availability
    if (!isRecurring) {
      if (!startDate) {
        errors.startDate = 'Start date is required';
      }

      if (startDate && endDate && startDate > endDate) {
        errors.endDate = 'End date must be after or equal to start date';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      if (!user) {
        throw new Error('You must be logged in to add availability');
      }

      const newAvailability = {
        service_agent_id: user.id,
        is_recurring: isRecurring,
        start_time: startTime,
        end_time: endTime,
        ...(isRecurring
          ? { day_of_week: dayOfWeek }
          : {
              start_date: startDate,
              end_date: endDate || startDate
            }
        )
      };

      const { error } = await supabase
        .from('service_agent_availability')
        .insert(newAvailability);

      if (error) throw error;

      // Show success message
      setSuccess('Availability added successfully!');

      // Reset form
      if (!isRecurring) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setStartDate(tomorrow.toISOString().split('T')[0]);
        setEndDate('');
      }
      setStartTime('09:00');
      setEndTime('17:00');

      // Refresh the list
      await fetchAvailability();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (err) {
      console.error('Error saving availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to save availability');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete availability with confirmation
  const deleteAvailability = async (id: string, dayInfo: string) => {
    // Ask for confirmation
    if (!window.confirm(`Are you sure you want to delete this availability for ${dayInfo}?`)) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from('service_agent_availability')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update the UI immediately
      setAvailabilities(availabilities.filter(a => a.id !== id));

      // Show success message
      setSuccess('Availability deleted successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (err) {
      console.error('Error deleting availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete availability');
    }
  };

  // Get day name from day number
  const getDayName = (day: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day % 7];
  };

  // Format time for display
  const formatTime = (time: string): string => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (e) {
      return time;
    }
  };

  // Filter availabilities based on active tab
  const filteredAvailabilities = availabilities.filter(a => 
    (activeTab === 'weekly' && a.is_recurring) || 
    (activeTab === 'specific' && !a.is_recurring)
  );

  return (
    <div>
      {/* Success message */}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm flex items-center">
          <Check className="h-4 w-4 mr-2" />
          {success}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('weekly');
              setIsRecurring(true);
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'weekly'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Weekly Schedule
          </button>
          <button
            onClick={() => {
              setActiveTab('specific');
              setIsRecurring(false);
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'specific'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Specific Dates
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {isRecurring ? 'Add Weekly Availability' : 'Add Specific Date Availability'}
          </h3>

          {isRecurring ? (
            <div className="mb-4">
              <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700 mb-1">
                Day of Week
              </label>
              <select
                id="dayOfWeek"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${validationErrors.startDate ? 'border-red-300' : 'border-gray-300'}`}
                  required={!isRecurring}
                />
                {validationErrors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.startDate}</p>
                )}
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${validationErrors.endDate ? 'border-red-300' : 'border-gray-300'}`}
                />
                {validationErrors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.endDate}</p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${validationErrors.startTime ? 'border-red-300' : 'border-gray-300'}`}
                required
              />
              {validationErrors.startTime && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.startTime}</p>
              )}
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${validationErrors.endTime ? 'border-red-300' : 'border-gray-300'}`}
                required
              />
              {validationErrors.endTime && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.endTime}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Availability
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-8">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          {activeTab === 'weekly' ? 'Weekly Schedule' : 'Specific Date Availability'}
        </h4>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredAvailabilities.length === 0 ? (
          <div className="bg-gray-50 rounded-md p-6 text-center">
            <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">
              {activeTab === 'weekly'
                ? 'No weekly schedule set yet. Add your regular working hours above.'
                : 'No specific dates set yet. Add availability for specific dates above.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAvailabilities.map((availability) => (
              <div key={availability.id} className="bg-white border border-gray-200 rounded-md p-4 flex justify-between items-center">
                <div className="flex items-start">
                  {availability.is_recurring ? (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Every {availability.day_of_week !== undefined ? getDayName(availability.day_of_week) : 'day'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatTime(availability.start_time)} - {formatTime(availability.end_time)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {availability.start_date} {availability.end_date && availability.end_date !== availability.start_date && `to ${availability.end_date}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatTime(availability.start_time)} - {formatTime(availability.end_time)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (!availability.id) return;
                    const dayInfo = availability.is_recurring
                      ? `every ${availability.day_of_week !== undefined ? getDayName(availability.day_of_week) : 'day'}`
                      : `${availability.start_date}${availability.end_date && availability.end_date !== availability.start_date ? ` to ${availability.end_date}` : ''}`;
                    deleteAvailability(availability.id, dayInfo);
                  }}
                  className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceAgentAvailability;
