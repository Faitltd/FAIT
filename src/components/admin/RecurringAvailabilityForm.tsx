import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Check, X, AlertCircle } from 'lucide-react';

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

interface RecurringAvailabilityFormProps {
  onSubmit: (availability: Availability) => Promise<Availability | null>;
  existingAvailability: Availability | null;
  onUpdate: (availability: Availability) => Promise<Availability | null>;
  onCancel: () => void;
}

/**
 * Recurring Availability Form Component
 * 
 * Form for setting recurring weekly availability.
 */
const RecurringAvailabilityForm: React.FC<RecurringAvailabilityFormProps> = ({
  onSubmit,
  existingAvailability,
  onUpdate,
  onCancel
}) => {
  const [dayOfWeek, setDayOfWeek] = useState<number>(0);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Initialize form with existing availability data if editing
  useEffect(() => {
    if (existingAvailability) {
      setDayOfWeek(existingAvailability.day_of_week || 0);
      setStartTime(existingAvailability.start_time);
      setEndTime(existingAvailability.end_time);
    }
  }, [existingAvailability]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const availabilityData: Availability = {
        is_recurring: true,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime
      };
      
      if (existingAvailability?.id) {
        // Update existing availability
        await onUpdate({
          ...availabilityData,
          id: existingAvailability.id
        });
      } else {
        // Create new availability
        await onSubmit(availabilityData);
        
        // Reset form
        setDayOfWeek(0);
        setStartTime('09:00');
        setEndTime('17:00');
      }
    } catch (err) {
      console.error('Error submitting availability:', err);
      setError('Failed to save availability. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className={`bg-white rounded-lg ${existingAvailability ? 'border-2 border-indigo-100' : ''}`}>
      {existingAvailability && (
        <div className="bg-indigo-50 px-4 py-2 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-indigo-800">Edit Weekly Availability</h4>
            <button
              type="button"
              onClick={onCancel}
              className="text-indigo-500 hover:text-indigo-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-4">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        
        <div className="space-y-4">
          {/* Day of week selection */}
          <div>
            <label htmlFor="day_of_week" className="block text-sm font-medium text-gray-700 mb-1">
              Day of Week
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="day_of_week"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(parseInt(e.target.value, 10))}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
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
          </div>
          
          {/* Time range selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  id="start_time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  id="end_time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Submit button */}
          <div className="flex justify-end">
            {existingAvailability && (
              <button
                type="button"
                onClick={onCancel}
                className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
            )}
            
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-700 transition-colors"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : existingAvailability ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Update
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Add Weekly Availability
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RecurringAvailabilityForm;
