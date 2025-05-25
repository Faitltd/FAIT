import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid token');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Profile not found');
    }

    if (profile.user_type !== 'contractor') {
      throw new Error('Only contractors can manage availability');
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('contractor_availability')
        .select('*')
        .eq('contractor_id', user.id)
        .order('day_of_week', { ascending: true });

      if (error) throw error;

      return new Response(
        JSON.stringify({ data }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    } else if (req.method === 'POST') {
      const availability = await req.json();
      
      if (!availability.is_recurring && (!availability.start_date || !availability.end_date)) {
        throw new Error('Start and end dates are required for non-recurring availability');
      }
      
      if (availability.is_recurring && typeof availability.day_of_week !== 'number') {
        throw new Error('Day of week is required for recurring availability');
      }
      
      if (!availability.start_time || !availability.end_time) {
        throw new Error('Start and end times are required');
      }

      availability.contractor_id = user.id;

      const { data, error } = await supabase
        .from('contractor_availability')
        .insert(availability)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ data }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    } else if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const id = url.searchParams.get('id');
      
      if (!id) {
        throw new Error('Availability ID is required');
      }

      const { data: existingAvailability, error: fetchError } = await supabase
        .from('contractor_availability')
        .select('contractor_id')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      
      if (existingAvailability.contractor_id !== user.id) {
        throw new Error('You can only delete your own availability');
      }

      const { error } = await supabase
        .from('contractor_availability')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ message: 'Availability deleted successfully' }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    } else {
      throw new Error(`Method ${req.method} not allowed`);
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
