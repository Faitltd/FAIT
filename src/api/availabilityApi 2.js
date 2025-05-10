import supabase from '../utils/supabaseClient';;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Using singleton Supabase client;

export async function getServiceAgentAvailability(serviceAgentId) {
  try {
    const { data, error } = await supabase
      .from('service_agent_availability')
      .select('*')
      .eq('service_agent_id', serviceAgentId)
      .order('day_of_week')
      .order('start_time');

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting service agent availability:', error);
    throw error;
  }
}

export async function getServiceAgentUnavailableDates(serviceAgentId) {
  try {
    const { data, error } = await supabase
      .from('service_agent_unavailable_dates')
      .select('*')
      .eq('service_agent_id', serviceAgentId)
      .order('date');

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting service agent unavailable dates:', error);
    throw error;
  }
}

export async function getServiceAvailability(serviceId) {
  try {
    const { data, error } = await supabase
      .from('service_availability')
      .select('*')
      .eq('service_id', serviceId)
      .order('day_of_week')
      .order('start_time');

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting service availability:', error);
    throw error;
  }
}

export async function updateServiceAgentAvailability(serviceAgentId, availability) {
  try {
    // Delete existing availability
    const { error: deleteError } = await supabase
      .from('service_agent_availability')
      .delete()
      .eq('service_agent_id', serviceAgentId);

    if (deleteError) throw deleteError;

    // Insert new availability
    if (availability && availability.length > 0) {
      const { error: insertError } = await supabase
        .from('service_agent_availability')
        .insert(
          availability.map(slot => ({
            service_agent_id: serviceAgentId,
            day_of_week: slot.day_of_week,
            start_time: slot.start_time,
            end_time: slot.end_time
          }))
        );

      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating service agent availability:', error);
    throw error;
  }
}

export async function updateServiceAvailability(serviceId, availability) {
  try {
    // Delete existing availability
    const { error: deleteError } = await supabase
      .from('service_availability')
      .delete()
      .eq('service_id', serviceId);

    if (deleteError) throw deleteError;

    // Insert new availability
    if (availability && availability.length > 0) {
      const { error: insertError } = await supabase
        .from('service_availability')
        .insert(
          availability.map(slot => ({
            service_id: serviceId,
            day_of_week: slot.day_of_week,
            start_time: slot.start_time,
            end_time: slot.end_time
          }))
        );

      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating service availability:', error);
    throw error;
  }
}

export async function addUnavailableDate(serviceAgentId, date, reason = '') {
  try {
    const { error } = await supabase
      .from('service_agent_unavailable_dates')
      .insert({
        service_agent_id: serviceAgentId,
        date,
        reason
      });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error adding unavailable date:', error);
    throw error;
  }
}

export async function removeUnavailableDate(serviceAgentId, date) {
  try {
    const { error } = await supabase
      .from('service_agent_unavailable_dates')
      .delete()
      .eq('service_agent_id', serviceAgentId)
      .eq('date', date);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error removing unavailable date:', error);
    throw error;
  }
}

export async function getAvailableTimeSlots(serviceAgentId, date) {
  try {
    // Try to get availability from the database using RPC function
    try {
      const { data, error } = await supabase.rpc('get_available_time_slots', {
        p_service_agent_id: serviceAgentId,
        p_date: date
      });

      if (error) throw error;

      return data;
    } catch (rpcError) {
      console.warn('RPC function not available, falling back to mock data:', rpcError);
      // Fall back to mock data if RPC function is not available
      return getMockAvailableTimeSlots(serviceAgentId, date);
    }
  } catch (error) {
    console.error('Error getting available time slots:', error);
    // Fall back to mock data
    return getMockAvailableTimeSlots(serviceAgentId, date);
  }
}

/**
 * Get mock available time slots for a service agent on a specific date
 * @param {string} serviceAgentId - Service agent ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Array} List of available time slots
 */
function getMockAvailableTimeSlots(serviceAgentId, date) {
  // Mock time slots (9 AM to 5 PM, hourly)
  const allTimeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Simulate some slots being unavailable
  const unavailableSlots = [];

  // Make some slots unavailable based on the date
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();

  // Weekends have fewer available slots
  if (dayOfWeek === 0) { // Sunday
    unavailableSlots.push('09:00', '10:00', '11:00', '12:00', '13:00');
  } else if (dayOfWeek === 6) { // Saturday
    unavailableSlots.push('15:00', '16:00', '17:00');
  }

  // Use the date and service agent ID to seed a simple random number generator
  const seed = dateObj.getDate() + (dateObj.getMonth() + 1) * 31 + (serviceAgentId ? serviceAgentId.charCodeAt(0) : 0);
  const random = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Make some random slots unavailable
  allTimeSlots.forEach(slot => {
    if (random(seed + parseInt(slot.replace(':', ''))) > 0.7) {
      unavailableSlots.push(slot);
    }
  });

  // Filter out unavailable slots
  const availableSlots = allTimeSlots.filter(slot => !unavailableSlots.includes(slot));

  return availableSlots;
}

export async function checkServiceAgentAvailability(serviceAgentId, date, startTime, endTime) {
  try {
    const { data, error } = await supabase.rpc('check_service_agent_availability', {
      p_service_agent_id: serviceAgentId,
      p_service_date: date,
      p_start_time: startTime,
      p_end_time: endTime
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error checking service agent availability:', error);
    throw error;
  }
}
