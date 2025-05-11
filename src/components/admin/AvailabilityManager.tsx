import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  Plus, 
  X, 
  Check, 
  AlertCircle, 
  Repeat, 
  CalendarDays,
  Edit,
  Trash2,
  Info
} from 'lucide-react';
import RecurringAvailabilityForm from './RecurringAvailabilityForm';
import SpecificDateAvailability from './SpecificDateAvailability';

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

/**
 * Availability Manager Component
 * 
 * Admin interface for managing service provider availability.
 * Supports recurring weekly schedules and specific date availability.
 */
const AvailabilityManager: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'weekly' | 'specific'>('weekly');
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null);
  
  // Fetch availabilities
  useEffect(() => {
    const fetchAvailabilities = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('service_agent_availability')
          .select('*')
          .eq('service_agent_id', user.id)
          .order('is_recurring', { ascending: false })
          .order('day_of_week', { ascending: true })
          .order('start_date', { ascending: true });
        
        if (error) throw error;
        
        setAvailabilities(data || []);
      } catch (err) {
        console.error('Error fetching availabilities:', err);
        setError('Failed to load availability data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailabilities();
  }, [user]);
  
  // Filter availabilities based on active tab
  const filteredAvailabilities = availabilities.filter(
    availability => activeTab === 'weekly' ? availability.is_recurring : !availability.is_recurring
  );
  
  // Handle availability creation
  const handleCreateAvailability = async (newAvailability: Availability) => {
    try {
      setError(null);
      
      if (!user) {
        throw new Error('You must be logged in to add availability');
      }
      
      const availabilityToCreate = {
        ...newAvailability,
        service_agent_id: user.id
      };
      
      const { data, error } = await supabase
        .from('service_agent_availability')
        .insert(availabilityToCreate)
        .select()
        .single();
      
      if (error) throw error;
      
      setAvailabilities(prev => [...prev, data]);
      setSuccess('Availability added successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      return data;
    } catch (err) {
      console.error('Error creating availability:', err);
      setError('Failed to add availability. Please try again.');
      return null;
    }
  };
  
  // Handle availability update
  const handleUpdateAvailability = async (updatedAvailability: Availability) => {
    try {
      setError(null);
      
      if (!updatedAvailability.id) {
        throw new Error('Availability ID is required for updates');
      }
      
      const { data, error } = await supabase
        .from('service_agent_availability')
        .update({
          is_recurring: updatedAvailability.is_recurring,
          day_of_week: updatedAvailability.day_of_week,
          start_date: updatedAvailability.start_date,
          end_date: updatedAvailability.end_date,
          start_time: updatedAvailability.start_time,
          end_time: updatedAvailability.end_time
        })
        .eq('id', updatedAvailability.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setAvailabilities(prev => 
        prev.map(item => item.id === updatedAvailability.id ? data : item)
      );
      
      setSuccess('Availability updated successfully!');
      setEditingAvailability(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      return data;
    } catch (err) {
      console.error('Error updating availability:', err);
      setError('Failed to update availability. Please try again.');
      return null;
    }
  };
  
  // Handle availability deletion
  const handleDeleteAvailability = async (id: string) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('service_agent_availability')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setAvailabilities(prev => prev.filter(item => item.id !== id));
      setSuccess('Availability removed successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting availability:', err);
      setError('Failed to remove availability. Please try again.');
    }
  };
  
  // Format day name
  const getDayName = (dayNumber: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber] || 'Unknown';
  };
  
  // Format time for display
  const formatTime = (timeString: string): string => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
    } catch (err) {
      return timeString;
    }
  };
  
  // Format date range for display
  const formatDateRange = (startDate?: string, endDate?: string): string => {
    if (!startDate) return 'No date specified';
    
    try {
      const start = new Date(startDate);
      const formattedStart = start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      if (!endDate || startDate === endDate) {
        return formattedStart;
      }
      
      const end = new Date(endDate);
      const formattedEnd = end.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      return `${formattedStart} to ${formattedEnd}`;
    } catch (err) {
      return startDate + (endDate ? ` to ${endDate}` : '');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
        <h2 className="text-2xl font-bold">Manage Your Availability</h2>
        <p className="mt-1 text-indigo-100">Set your regular schedule and specific dates when you're available for bookings.</p>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'weekly'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center">
              <Repeat className="h-4 w-4 mr-2" />
              Weekly Schedule
            </div>
          </button>
          <button
            onClick={() => setActiveTab('specific')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'specific'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-2" />
              Specific Dates
            </div>
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Error and success messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3 flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}
        
        {/* Form for adding availability */}
        {activeTab === 'weekly' ? (
          <RecurringAvailabilityForm
            onSubmit={handleCreateAvailability}
            existingAvailability={editingAvailability?.is_recurring ? editingAvailability : null}
            onUpdate={handleUpdateAvailability}
            onCancel={() => setEditingAvailability(null)}
          />
        ) : (
          <SpecificDateAvailability
            onSubmit={handleCreateAvailability}
            existingAvailability={!editingAvailability?.is_recurring ? editingAvailability : null}
            onUpdate={handleUpdateAvailability}
            onCancel={() => setEditingAvailability(null)}
          />
        )}
        
        {/* List of availabilities */}
        <div className="mt-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {activeTab === 'weekly' ? 'Weekly Schedule' : 'Specific Date Availability'}
          </h4>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
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
                        <Calendar className="h-5 w-5 text-indigo-600 mr-3" />
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
                            {formatDateRange(availability.start_date, availability.end_date)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatTime(availability.start_time)} - {formatTime(availability.end_time)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingAvailability(availability)}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      aria-label="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => availability.id && handleDeleteAvailability(availability.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Help text */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-md p-4 flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-medium text-blue-800 mb-1">How availability works</h5>
            <p className="text-sm text-blue-700">
              {activeTab === 'weekly'
                ? 'Weekly schedules repeat every week. Clients can book appointments during these times unless you set specific unavailable dates.'
                : 'Specific dates override your weekly schedule. Use this for special events, holidays, or when you want to offer services outside your regular hours.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityManager;
