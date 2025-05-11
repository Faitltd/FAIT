import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const PAYPAL_API = Deno.env.get('PAYPAL_ENVIRONMENT') === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) throw new Error('Invalid token');

    // Get request data
    const { bookingId, orderId } = await req.json();

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        service_package:service_packages(price, service_agent_id, contractor_id)
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError) throw bookingError;

    // Get PayPal access token
    const tokenResponse = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${Deno.env.get('PAYPAL_CLIENT_ID')}:${Deno.env.get('PAYPAL_SECRET')}`)}`
      },
      body: 'grant_type=client_credentials'
    });

    const { access_token } = await tokenResponse.json();

    // Capture PayPal order
    const captureResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      }
    });

    const captureData = await captureResponse.json();

    if (captureData.error) {
      throw new Error(captureData.error_description || 'Failed to capture PayPal payment');
    }

    // Calculate platform fee (10%)
    const amount = booking.service_package.price;
    const fee = amount * 0.1;
    const netAmount = amount - fee;

    // Record payment transaction
    await supabase
      .from('payment_transactions')
      .insert({
        booking_id: bookingId,
        client_id: user.id,
        service_agent_id: booking.service_package.service_agent_id || booking.service_package.contractor_id,
        amount: amount,
        fee: fee,
        net_amount: netAmount,
        payment_method: 'paypal',
        payment_processor: 'paypal',
        processor_payment_id: captureData.id,
        status: 'completed'
      });

    // Update booking with payment info
    await supabase
      .from('bookings')
      .update({
        payment_status: 'paid',
        payment_id: captureData.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    return new Response(
      JSON.stringify({ success: true, captureData }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});