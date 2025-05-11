import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export interface TimeSlot {
  start_time: string;
  end_time: string;
}

export interface DayAvailability {
  day_of_week: number;
  time_slots: TimeSlot[];
}

export interface UnavailableDate {
  id: string;
  date: string;
  reason: string;
}

export interface AvailabilityData {
  weeklyAvailability: DayAvailability[];
  unavailableDates: UnavailableDate[];
}

interface UseAvailabilityOptions {
  serviceAgentId?: string;
  onError?: (error: Error) => void;
}

/**
 * Hook for managing service agent availability
 */
export function useAvailability(options: UseAvailabilityOptions = {}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [weeklyAvailability, setWeeklyAvailability] = useState<DayAvailability[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([]);

  // Determine which service agent ID to use
  const serviceAgentId = options.serviceAgentId || user?.id;

  /**
   * Fetch availability data from the database
   */
  const fetchAvailability = useCallback(async () => {
    if (!serviceAgentId) return;

    try {
      setLoading(true);
      
      // Fetch weekly availability
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('service_agent_availability')
        .select('*')
        .eq('service_agent_id', serviceAgentId)
        .order('day_of_week')
        .order('start_time');

      if (availabilityError) throw availabilityError;

      // Process availability data into day-based structure
      const processedAvailability: DayAvailability[] = [];
      
      // Initialize empty array for each day of the week
      for (let i = 0; i < 7; i++) {
        processedAvailability[i] = {
          day_of_week: i,
          time_slots: []
        };
      }

      // Fill in the time slots for each day
      availabilityData?.forEach(slot => {
        const dayIndex = slot.day_of_week;
        if (processedAvailability[dayIndex]) {
          processedAvailability[dayIndex].time_slots.push({
            start_time: slot.start_time,
            end_time: slot.end_time
          });
        }
      });

      setWeeklyAvailability(processedAvailability);

      // Fetch unavailable dates
      const { data: unavailableDatesData, error: unavailableDatesError } = await supabase
        .from('service_agent_unavailable_dates')
        .select('*')
        .eq('service_agent_id', serviceAgentId)
        .gte('date', new Date().toISOString().split('T')[0]) // Only future dates
        .order('date');

      if (unavailableDatesError) throw unavailableDatesError;

      setUnavailableDates(unavailableDatesData || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching availability:', err);
      const error = new Error(err instanceof Error ? err.message : 'Failed to load availability');
      setError(error);
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [serviceAgentId, options]);

  /**
   * Update weekly availability
   */
  const updateWeeklyAvailability = useCallback(async (dayAvailability: DayAvailability) => {
    if (!serviceAgentId) return false;

    try {
      setSaving(true);
      
      // Delete existing time slots for this day
      const { error: deleteError } = await supabase
        .from('service_agent_availability')
        .delete()
        .eq('service_agent_id', serviceAgentId)
        .eq('day_of_week', dayAvailability.day_of_week);

      if (deleteError) throw deleteError;

      // Insert new time slots
      if (dayAvailability.time_slots.length > 0) {
        const slotsToInsert = dayAvailability.time_slots.map(slot => ({
          service_agent_id: serviceAgentId,
          day_of_week: dayAvailability.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time
        }));

        const { error: insertError } = await supabase
          .from('service_agent_availability')
          .insert(slotsToInsert);

        if (insertError) throw insertError;
      }

      // Update local state
      setWeeklyAvailability(prev => {
        const updated = [...prev];
        updated[dayAvailability.day_of_week] = dayAvailability;
        return updated;
      });

      return true;
    } catch (err) {
      console.error('Error updating availability:', err);
      const error = new Error(err instanceof Error ? err.message : 'Failed to update availability');
      setError(error);
      options.onError?.(error);
      return false;
    } finally {
      setSaving(false);
    }
  }, [serviceAgentId, options]);

  /**
   * Add an unavailable date
   */
  const addUnavailableDate = useCallback(async (date: string, reason: string) => {
    if (!serviceAgentId) return false;

    try {
      setSaving(true);
      
      // Check if date already exists
      const { data: existingDate } = await supabase
        .from('service_agent_unavailable_dates')
        .select('id')
        .eq('service_agent_id', serviceAgentId)
        .eq('date', date)
        .single();

      if (existingDate) {
        // Update existing date
        const { error: updateError } = await supabase
          .from('service_agent_unavailable_dates')
          .update({ reason })
          .eq('id', existingDate.id);

        if (updateError) throw updateError;

        // Update local state
        setUnavailableDates(prev => 
          prev.map(d => d.id === existingDate.id ? { ...d, reason } : d)
        );
      } else {
        // Insert new date
        const { data: newDate, error: insertError } = await supabase
          .from('service_agent_unavailable_dates')
          .insert({
            service_agent_id: serviceAgentId,
            date,
            reason
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Update local state
        if (newDate) {
          setUnavailableDates(prev => [...prev, newDate]);
        }
      }

      return true;
    } catch (err) {
      console.error('Error adding unavailable date:', err);
      const error = new Error(err instanceof Error ? err.message : 'Failed to add unavailable date');
      setError(error);
      options.onError?.(error);
      return false;
    } finally {
      setSaving(false);
    }
  }, [serviceAgentId, options]);

  /**
   * Remove an unavailable date
   */
  const removeUnavailableDate = useCallback(async (id: string) => {
    if (!serviceAgentId) return false;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('service_agent_unavailable_dates')
        .delete()
        .eq('id', id)
        .eq('service_agent_id', serviceAgentId);

      if (error) throw error;

      // Update local state
      setUnavailableDates(prev => prev.filter(d => d.id !== id));
      
      return true;
    } catch (err) {
      console.error('Error removing unavailable date:', err);
      const error = new Error(err instanceof Error ? err.message : 'Failed to remove unavailable date');
      setError(error);
      options.onError?.(error);
      return false;
    } finally {
      setSaving(false);
    }
  }, [serviceAgentId, options]);

  /**
   * Check if a specific date and time is available
   */
  const checkAvailability = useCallback(async (date: string, startTime: string, endTime: string) => {
    if (!serviceAgentId) return false;

    try {
      // Call the database function to check availability
      const { data, error } = await supabase.rpc('check_service_agent_availability', {
        p_service_agent_id: serviceAgentId,
        p_service_date: date,
        p_start_time: startTime,
        p_end_time: endTime
      });

      if (error) throw error;

      return data || false;
    } catch (err) {
      console.error('Error checking availability:', err);
      return false;
    }
  }, [serviceAgentId]);

  /**
   * Get available time slots for a specific date
   */
  const getAvailableTimeSlots = useCallback(async (date: string) => {
    if (!serviceAgentId) return [];

    try {
      // Call the Edge Function to get available slots
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/available-slots?serviceAgentId=${serviceAgentId}&startDate=${date}&endDate=${date}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch available time slots');
      }
      
      const data = await response.json();
      return data || [];
    } catch (err) {
      console.error('Error getting available time slots:', err);
      return [];
    }
  }, [serviceAgentId]);

  // Load availability data on mount
  useEffect(() => {
    if (serviceAgentId) {
      fetchAvailability();
    }
  }, [serviceAgentId, fetchAvailability]);

  return {
    loading,
    saving,
    error,
    weeklyAvailability,
    unavailableDates,
    fetchAvailability,
    updateWeeklyAvailability,
    addUnavailableDate,
    removeUnavailableDate,
    checkAvailability,
    getAvailableTimeSlots
  };
}

export default useAvailability;
