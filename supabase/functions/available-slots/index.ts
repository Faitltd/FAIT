import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const serviceAgentId = url.searchParams.get('serviceAgentId') || url.searchParams.get('contractorId'); // Support both for backward compatibility
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    if (!serviceAgentId || !startDate) {
      throw new Error('Missing required parameters');
    }

    // Calculate end date if not provided (default to 14 days from start)
    const calculatedEndDate = endDate ||
      new Date(new Date(startDate).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Check if service_agent_availability table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'service_agent_availability');

    if (tablesError) throw tablesError;

    // Determine which table to use
    const availabilityTable = tables && tables.length > 0 ? 'service_agent_availability' : 'contractor_availability';
    const idColumn = tables && tables.length > 0 ? 'service_agent_id' : 'contractor_id';

    // Get recurring availability
    const { data: recurringAvailability, error: recurringError } = await supabase
      .from(availabilityTable)
      .select('*')
      .eq(idColumn, serviceAgentId)
      .eq('is_recurring', true);

    if (recurringError) throw recurringError;

    // Get one-time availability
    const { data: oneTimeAvailability, error: oneTimeError } = await supabase
      .from(availabilityTable)
      .select('*')
      .eq(idColumn, serviceAgentId)
      .eq('is_recurring', false)
      .lte('start_date', calculatedEndDate)
      .gte('end_date', startDate);

    if (oneTimeError) throw oneTimeError;

    // Check if bookings table has service_agent_id column
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'bookings')
      .eq('column_name', 'service_agent_id');

    if (columnsError) throw columnsError;

    // Determine which column to use for bookings
    const bookingIdColumn = columns && columns.length > 0 ? 'service_agent_id' : 'contractor_id';

    // Get existing bookings
    const { data: existingBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('scheduled_date, scheduled_time, duration')
      .eq(bookingIdColumn, serviceAgentId)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', calculatedEndDate)
      .in('status', ['confirmed', 'in_progress']);

    if (bookingsError) throw bookingsError;

    // Process and return available slots
    const availableSlots = calculateAvailableSlots(
      startDate,
      calculatedEndDate,
      recurringAvailability || [],
      oneTimeAvailability || [],
      existingBookings || []
    );

    return new Response(
      JSON.stringify({ data: availableSlots }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});

// Helper function to calculate available slots
function calculateAvailableSlots(startDate, endDate, recurringAvailability, oneTimeAvailability, existingBookings) {
  const availableSlots = [];
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  // Create a map of dates to booked time slots
  const bookedSlots = {};
  existingBookings.forEach(booking => {
    const date = booking.scheduled_date;
    if (!bookedSlots[date]) {
      bookedSlots[date] = [];
    }

    // Convert booking time to minutes for easier calculation
    const [hours, minutes] = booking.scheduled_time.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + booking.duration;

    bookedSlots[date].push({ start: startMinutes, end: endMinutes });
  });

  // Loop through each day in the date range
  for (let currentDate = new Date(startDateObj); currentDate <= endDateObj; currentDate.setDate(currentDate.getDate() + 1)) {
    const dateString = currentDate.toISOString().split('T')[0];
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Find applicable availability for this day
    let dayAvailability = [];

    // Check one-time availability first (it overrides recurring)
    const oneTimeForDay = oneTimeAvailability.filter(slot => {
      const slotStartDate = new Date(slot.start_date);
      const slotEndDate = new Date(slot.end_date);
      return currentDate >= slotStartDate && currentDate <= slotEndDate;
    });

    if (oneTimeForDay.length > 0) {
      // Use one-time availability
      oneTimeForDay.forEach(slot => {
        if (slot.available_hours) {
          dayAvailability.push({
            start: slot.available_hours.start,
            end: slot.available_hours.end
          });
        }
      });
    } else {
      // Use recurring availability
      const recurringForDay = recurringAvailability.filter(slot => {
        // Check if this recurring slot applies to the current day of week
        return slot.days_of_week && slot.days_of_week.includes(dayOfWeek);
      });

      recurringForDay.forEach(slot => {
        if (slot.available_hours) {
          dayAvailability.push({
            start: slot.available_hours.start,
            end: slot.available_hours.end
          });
        }
      });
    }

    // If no availability for this day, skip to next day
    if (dayAvailability.length === 0) {
      continue;
    }

    // Convert availability times to minutes for easier calculation
    const availabilityInMinutes = dayAvailability.map(slot => {
      const [startHours, startMinutes] = slot.start.split(':').map(Number);
      const [endHours, endMinutes] = slot.end.split(':').map(Number);
      return {
        start: startHours * 60 + startMinutes,
        end: endHours * 60 + endMinutes
      };
    });

    // Generate time slots in 30-minute increments
    availabilityInMinutes.forEach(slot => {
      for (let time = slot.start; time < slot.end; time += 30) {
        // Check if this slot overlaps with any booked slots
        const isBooked = (bookedSlots[dateString] || []).some(bookedSlot => {
          // A slot is considered booked if it overlaps with a booking
          return (time >= bookedSlot.start && time < bookedSlot.end) ||
                 (time + 30 > bookedSlot.start && time + 30 <= bookedSlot.end);
        });

        if (!isBooked) {
          // Convert back to hours:minutes format
          const hours = Math.floor(time / 60);
          const minutes = time % 60;
          const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

          availableSlots.push({
            date: dateString,
            time: timeString,
            duration: 30 // Default duration in minutes
          });
        }
      }
    });
  }

  return availableSlots;
}