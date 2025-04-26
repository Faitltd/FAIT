import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const CHECKR_API_KEY = Deno.env.get('CHECKR_API_KEY');
const CHECKR_API_URL = 'https://api.checkr.com/v1';

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
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid token');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Profile not found');
    }

    const candidateResponse = await fetch(`${CHECKR_API_URL}/candidates`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(CHECKR_API_KEY + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: profile.full_name.split(' ')[0],
        last_name: profile.full_name.split(' ').slice(1).join(' '),
        email: profile.email,
        phone: profile.phone,
      }),
    });

    if (!candidateResponse.ok) {
      throw new Error('Failed to create candidate');
    }

    const candidate = await candidateResponse.json();

    const checkResponse = await fetch(`${CHECKR_API_URL}/screenings`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(CHECKR_API_KEY + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        candidate_id: candidate.id,
        package: 'tasker_pro',
      }),
    });

    if (!checkResponse.ok) {
      throw new Error('Failed to create background check');
    }

    const check = await checkResponse.json();

    const { error: updateError } = await supabase
      .from('service_agent_verifications')
      .update({
        background_check_status: 'in_progress',
        background_check_date: new Date().toISOString(),
        checkr_candidate_id: candidate.id,
        checkr_report_id: check.id,
      })
      .eq('service_agent_id', user.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ message: 'Background check initiated' }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
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
