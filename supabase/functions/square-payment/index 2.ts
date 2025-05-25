import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { Client, Environment } from 'https://esm.sh/square@25.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get request body
    const { sourceId, amount, bookingId, currency = 'USD' } = await req.json();

    if (!sourceId || !amount || !bookingId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Get booking details to verify ownership
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, client_id, service_agent_id, service_package_id, total_amount')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Verify that the user is the client for this booking
    if (booking.client_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized to make payment for this booking' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Verify that the amount matches the booking amount
    if (booking.total_amount !== amount) {
      return new Response(
        JSON.stringify({ error: 'Payment amount does not match booking amount' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Square client
    const squareAccessToken = Deno.env.get('SQUARE_ACCESS_TOKEN');
    const squareLocationId = Deno.env.get('SQUARE_LOCATION_ID');

    if (!squareAccessToken || !squareLocationId) {
      return new Response(
        JSON.stringify({ error: 'Square configuration is missing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const squareClient = new Client({
      accessToken: squareAccessToken,
      environment: Environment.Sandbox, // Change to Production for live payments
    });

    // Create a unique idempotency key for this payment
    const idempotencyKey = crypto.randomUUID();

    // Process the payment with Square
    const { result, statusCode } = await squareClient.paymentsApi.createPayment({
      sourceId,
      idempotencyKey,
      amountMoney: {
        amount: Math.round(amount * 100), // Convert to cents
        currency,
      },
      locationId: squareLocationId,
      referenceId: bookingId,
      note: `Payment for booking ${bookingId}`,
    });

    if (statusCode !== 200 || !result.payment) {
      return new Response(
        JSON.stringify({ error: 'Failed to process payment with Square' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Return the payment details
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: result.payment.id,
          status: result.payment.status,
          amount: amount,
          currency: currency,
          created_at: result.payment.createdAt,
          service_agent_id: booking.service_agent_id,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing payment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process payment' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
