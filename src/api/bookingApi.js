import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get bookings for the current user
 * @param {Object} options - Options for filtering bookings
 * @param {string} options.userId - User ID
 * @param {string} options.userType - User type (client or service_agent)
 * @param {string} options.status - Booking status filter
 * @param {string} options.sortBy - Field to sort by
 * @param {string} options.sortDirection - Sort direction (asc or desc)
 * @returns {Promise<Array>} List of bookings
 */
export const getBookings = async (options = {}) => {
  try {
    const { userId, userType, status, sortBy = 'date', sortDirection = 'desc' } = options;
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Start building the query
    let query = supabase
      .from('bookings')
      .select(`
        *,
        service:services(id, name, category, price),
        client:client_id(id, first_name, last_name, email, phone, avatar_url),
        service_agent:service_agent_id(id, first_name, last_name, email, phone, avatar_url)
      `);
    
    // Filter by user type
    if (userType === 'client') {
      query = query.eq('client_id', userId);
    } else if (userType === 'service_agent') {
      query = query.eq('service_agent_id', userId);
    }
    
    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Process the results
    const bookings = data.map(booking => ({
      id: booking.id,
      service_id: booking.service_id,
      service_name: booking.service.name,
      service_category: booking.service.category,
      client_id: booking.client_id,
      client_name: `${booking.client.first_name} ${booking.client.last_name}`,
      client_email: booking.client.email,
      client_phone: booking.client.phone,
      client_avatar: booking.client.avatar_url,
      service_agent_id: booking.service_agent_id,
      service_agent_name: `${booking.service_agent.first_name} ${booking.service_agent.last_name}`,
      service_agent_email: booking.service_agent.email,
      service_agent_phone: booking.service_agent.phone,
      service_agent_avatar: booking.service_agent.avatar_url,
      service_date: booking.service_date,
      start_time: booking.start_time,
      end_time: booking.end_time,
      status: booking.status,
      price: booking.price || booking.service.price,
      address: booking.address,
      zip_code: booking.zip_code,
      notes: booking.notes,
      payment_status: booking.payment_status,
      cancellation_reason: booking.cancellation_reason,
      created_at: booking.created_at,
      updated_at: booking.updated_at
    }));
    
    // Sort the results
    bookings.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'service':
          comparison = a.service_name.localeCompare(b.service_name);
          break;
        case 'date':
          comparison = new Date(a.service_date) - new Date(b.service_date);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = new Date(a.service_date) - new Date(b.service_date);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return bookings;
  } catch (error) {
    console.error('Error getting bookings:', error);
    throw error;
  }
};

/**
 * Get a booking by ID
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} Booking details
 */
export const getBookingById = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        service:services(id, name, category, price),
        client:client_id(id, first_name, last_name, email, phone, avatar_url),
        service_agent:service_agent_id(id, first_name, last_name, email, phone, avatar_url)
      `)
      .eq('id', bookingId)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      service_id: data.service_id,
      service_name: data.service.name,
      service_category: data.service.category,
      client_id: data.client_id,
      client_name: `${data.client.first_name} ${data.client.last_name}`,
      client_email: data.client.email,
      client_phone: data.client.phone,
      client_avatar: data.client.avatar_url,
      service_agent_id: data.service_agent_id,
      service_agent_name: `${data.service_agent.first_name} ${data.service_agent.last_name}`,
      service_agent_email: data.service_agent.email,
      service_agent_phone: data.service_agent.phone,
      service_agent_avatar: data.service_agent.avatar_url,
      service_date: data.service_date,
      start_time: data.start_time,
      end_time: data.end_time,
      status: data.status,
      price: data.price || data.service.price,
      address: data.address,
      zip_code: data.zip_code,
      notes: data.notes,
      payment_status: data.payment_status,
      cancellation_reason: data.cancellation_reason,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error getting booking by ID:', error);
    throw error;
  }
};

/**
 * Create a new booking
 * @param {Object} booking - Booking data
 * @returns {Promise<Object>} Created booking
 */
export const createBooking = async (booking) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Ensure client_id is set to the current user
    const bookingData = {
      ...booking,
      client_id: user.id
    };
    
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

/**
 * Update a booking's status
 * @param {string} bookingId - Booking ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated booking
 */
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

/**
 * Cancel a booking
 * @param {string} bookingId - Booking ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} Updated booking
 */
export const cancelBooking = async (bookingId, reason) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason
      })
      .eq('id', bookingId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

/**
 * Update a booking's notes
 * @param {string} bookingId - Booking ID
 * @param {string} notes - New notes
 * @returns {Promise<Object>} Updated booking
 */
export const updateBookingNotes = async (bookingId, notes) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ notes })
      .eq('id', bookingId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating booking notes:', error);
    throw error;
  }
};

/**
 * Get available time slots for a service agent on a specific date
 * @param {string} serviceAgentId - Service agent ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} List of available time slots
 */
export const getAvailableTimeSlots = async (serviceAgentId, date) => {
  try {
    // In a real implementation, this would call a Supabase function or API
    // For now, we'll return mock data
    
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
    
    // Use the date to seed a simple random number generator
    const seed = dateObj.getDate() + (dateObj.getMonth() + 1) * 31;
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
  } catch (error) {
    console.error('Error getting available time slots:', error);
    throw error;
  }
};
