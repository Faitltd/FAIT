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
    const contractorId = url.searchParams.get('contractorId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    if (!contractorId || !startDate) {
      throw new Error('Missing required parameters');
    }
    
    // Calculate end date if not provided (default to 14 days from start)
    const calculatedEndDate = endDate || 
      new Date(new Date(startDate).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Get recurring availability
    const { data: recurringAvailability, error: recurringError } = await supabase
      .from('contractor_availability')
      .select('*')
      .eq('contractor_id', contractorId)
      .eq('is_recurring', true);
      
    if (recurringError) throw recurringError;
    
    // Get one-time availability
    const { data: oneTimeAvailability, error: oneTimeError } = await supabase
      .from('contractor_availability')
      .select('*')
      .eq('contractor_id', contractorId)
      .eq('is_recurring', false)
      .lte('start_date', calculatedEndDate)
      .gte('end_date', startDate);
      
    if (oneTimeError) throw oneTimeError;
    
    // Get existing bookings
    const { data: existingBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('scheduled_date, scheduled_time, duration')
      .eq('contractor_id', contractorId)
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
  // Implementation details omitted for brevity
  // This would calculate available time slots based on availability and existing bookings
  
  return []; // Return array of available date/time slots
}