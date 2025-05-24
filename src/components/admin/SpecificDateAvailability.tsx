import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Check, X, AlertCircle } from 'lucide-react';
import { addDays } from 'date-fns';

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

interface SpecificDateAvailabilityProps {
  onSubmit: (availability: Availability) => Promise<Availability | null>;
  existingAvailability: Availability | null;
  onUpdate: (availability: Availability) => Promise<Availability | null>;
  onCancel: () => void;
}

/**
 * Specific Date Availability Component
 * 
 * Form for setting availability on specific dates.
 */
const SpecificDateAvailability: React.FC<SpecificDateAvailabilityProps> = ({
  onSubmit,
  existingAvailability,
  onUpdate,
  onCancel
}) => {
  // Get tomorrow's date in YYYY-MM-DD format for default
  const getTomorrow = () => {
    const tomorrow = addDays(new Date(), 1);
    return tomorrow.toISOString().split('T')[0];
  };
  
  const [startDate, setStartDate] = useState<string>(getTomorrow());
  const [endDate, setEndDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Initialize form with existing availability data if editing
  useEffect(() => {
    if (existingAvailability) {
      setStartDate(existingAvailability.start_date || getTomorrow());
      setEndDate(existingAvailability.end_date || '');
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
    
    if (endDate && endDate < startDate) {
      setError('End date must be on or after start date');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const availabilityData: Availability = {
        is_recurring: false,
        start_date: startDate,
        end_date: endDate || startDate, // If no end date, use start date
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
        setStartDate(getTomorrow());
        setEndDate('');
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
    <div className={`bg-white rounded-lg ${existingAvailability ? 'border-2 border-green-100' : ''}`}>
      {existingAvailability && (
        <div className="bg-green-50 px-4 py-2 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-green-800">Edit Specific Date Availability</h4>
            <button
              type="button"
              onClick={onCancel}
              className="text-green-500 hover:text-green-700"
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
          {/* Date range selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="start_date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} // Min date is today
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="end_date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate} // Min date is start date
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Leave blank for single day availability
              </p>
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
              className="flex items-center px-4 py-2 bg-green-600 rounded-md text-white hover:bg-green-700 transition-colors"
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
                  Add Specific Date
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SpecificDateAvailability;
