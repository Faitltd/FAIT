import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  getServiceAgentAvailability, 
  getServiceAgentUnavailableDates,
  updateServiceAgentAvailability,
  addUnavailableDate,
  removeUnavailableDate
} from '../../api/availabilityApi';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

const AvailabilityCalendar = () => {
  const [availability, setAvailability] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0); // 0 = Sunday, 6 = Saturday
  const [selectedTimeSlots, setSelectedTimeSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('weekly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [unavailableDateReason, setUnavailableDateReason] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        fetchAvailability(user.id);
        fetchUnavailableDates(user.id);
      }
    };
    
    fetchUser();
  }, []);

  useEffect(() => {
    // Initialize selected time slots based on availability
    if (availability.length > 0) {
      const slots = {};
      
      DAYS_OF_WEEK.forEach((_, dayIndex) => {
        slots[dayIndex] = {};
        TIME_SLOTS.forEach(time => {
          slots[dayIndex][time] = false;
        });
      });
      
      availability.forEach(slot => {
        const dayIndex = slot.day_of_week;
        const startHour = parseInt(slot.start_time.split(':')[0]);
        const endHour = parseInt(slot.end_time.split(':')[0]);
        
        for (let hour = startHour; hour < endHour; hour++) {
          const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
          slots[dayIndex][timeSlot] = true;
        }
      });
      
      setSelectedTimeSlots(slots);
    }
  }, [availability]);

  const fetchAvailability = async (userId) => {
    try {
      setLoading(true);
      const data = await getServiceAgentAvailability(userId);
      setAvailability(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnavailableDates = async (userId) => {
    try {
      const data = await getServiceAgentUnavailableDates(userId);
      setUnavailableDates(data);
    } catch (err) {
      console.error('Error fetching unavailable dates:', err);
    }
  };

  const handleTimeSlotClick = (time) => {
    setSelectedTimeSlots(prev => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [time]: !prev[selectedDay][time]
      }
    }));
  };

  const handleSaveAvailability = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Convert selected time slots to availability format
      const newAvailability = [];
      
      Object.entries(selectedTimeSlots).forEach(([dayIndex, timeSlots]) => {
        const day = parseInt(dayIndex);
        let currentStart = null;
        let currentEnd = null;
        
        // Sort time slots
        const sortedTimeSlots = Object.entries(timeSlots)
          .sort(([timeA], [timeB]) => {
            return timeA.localeCompare(timeB);
          });
        
        // Find continuous blocks
        sortedTimeSlots.forEach(([time, isSelected], index) => {
          const hour = parseInt(time.split(':')[0]);
          
          if (isSelected && currentStart === null) {
            // Start a new block
            currentStart = hour;
            currentEnd = hour + 1;
          } else if (isSelected && currentStart !== null) {
            // Extend current block
            currentEnd = hour + 1;
          } else if (!isSelected && currentStart !== null) {
            // End current block
            newAvailability.push({
              day_of_week: day,
              start_time: `${currentStart.toString().padStart(2, '0')}:00:00`,
              end_time: `${currentEnd.toString().padStart(2, '0')}:00:00`
            });
            currentStart = null;
            currentEnd = null;
          }
          
          // Handle last slot
          if (index === sortedTimeSlots.length - 1 && currentStart !== null) {
            newAvailability.push({
              day_of_week: day,
              start_time: `${currentStart.toString().padStart(2, '0')}:00:00`,
              end_time: `${currentEnd.toString().padStart(2, '0')}:00:00`
            });
          }
        });
      });
      
      await updateServiceAgentAvailability(user.id, newAvailability);
      
      // Refresh availability
      await fetchAvailability(user.id);
      
      alert('Availability saved successfully');
    } catch (err) {
      console.error('Error saving availability:', err);
      setError('Failed to save availability');
      alert('Failed to save availability. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddUnavailableDate = async () => {
    if (!user || !selectedDate) return;
    
    try {
      setSaving(true);
      
      await addUnavailableDate(
        user.id,
        format(selectedDate, 'yyyy-MM-dd'),
        unavailableDateReason
      );
      
      // Refresh unavailable dates
      await fetchUnavailableDates(user.id);
      
      // Reset form
      setUnavailableDateReason('');
      
      alert('Date marked as unavailable');
    } catch (err) {
      console.error('Error adding unavailable date:', err);
      alert('Failed to mark date as unavailable. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveUnavailableDate = async (date) => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      await removeUnavailableDate(user.id, date);
      
      // Refresh unavailable dates
      await fetchUnavailableDates(user.id);
      
      alert('Date removed from unavailable dates');
    } catch (err) {
      console.error('Error removing unavailable date:', err);
      alert('Failed to remove date. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isDateUnavailable = (date) => {
    return unavailableDates.some(unavailableDate => 
      isSameDay(parseISO(unavailableDate.date), date)
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Manage Your Availability
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Set your regular working hours and mark specific dates as unavailable.
        </p>
      </div>
      
      <div className="border-t border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-4">
            <div className="sm:hidden">
              <label htmlFor="tabs" className="sr-only">Select a tab</label>
              <select
                id="tabs"
                name="tabs"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
              >
                <option value="weekly">Weekly Schedule</option>
                <option value="dates">Unavailable Dates</option>
              </select>
            </div>
            <div className="hidden sm:block">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('weekly')}
                    className={`${
                      activeTab === 'weekly'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Weekly Schedule
                  </button>
                  <button
                    onClick={() => setActiveTab('dates')}
                    className={`${
                      activeTab === 'dates'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Unavailable Dates
                  </button>
                </nav>
              </div>
            </div>
          </div>
          
          {activeTab === 'weekly' && (
            <div>
              <div className="mb-4">
                <label htmlFor="day-select" className="block text-sm font-medium text-gray-700">
                  Select Day
                </label>
                <select
                  id="day-select"
                  name="day-select"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                >
                  {DAYS_OF_WEEK.map((day, index) => (
                    <option key={day} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Select Available Hours for {DAYS_OF_WEEK[selectedDay]}
                </h4>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                  {TIME_SLOTS.map(time => (
                    <button
                      key={time}
                      className={`py-2 px-3 text-sm font-medium rounded-md ${
                        selectedTimeSlots[selectedDay]?.[time]
                          ? 'bg-blue-100 text-blue-700 border-blue-300'
                          : 'bg-gray-50 text-gray-700 border-gray-300'
                      } border`}
                      onClick={() => handleTimeSlotClick(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAvailability}
                  disabled={saving}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    saving ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Availability'}
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'dates' && (
            <div>
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Mark Dates as Unavailable
                </h4>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        name="date"
                        id="date"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={format(selectedDate, 'yyyy-MM-dd')}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                      Reason (optional)
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="reason"
                        id="reason"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={unavailableDateReason}
                        onChange={(e) => setUnavailableDateReason(e.target.value)}
                        placeholder="e.g., Vacation, Personal Day"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleAddUnavailableDate}
                    disabled={saving || isDateUnavailable(selectedDate)}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      (saving || isDateUnavailable(selectedDate)) ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {saving ? 'Adding...' : 'Mark as Unavailable'}
                  </button>
                  {isDateUnavailable(selectedDate) && (
                    <p className="mt-2 text-sm text-red-600">
                      This date is already marked as unavailable.
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  Your Unavailable Dates
                </h4>
                
                {unavailableDates.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    You haven't marked any dates as unavailable.
                  </p>
                ) : (
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                            Date
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Reason
                          </th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {unavailableDates.map((date) => (
                          <tr key={date.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {format(parseISO(date.date), 'MMMM d, yyyy')}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {date.reason || 'No reason provided'}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <button
                                onClick={() => handleRemoveUnavailableDate(date.date)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
