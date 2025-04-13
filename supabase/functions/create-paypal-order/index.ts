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
    const { bookingId, amount } = await req.json();
    
    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        service_package:service_packages(title)
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
    
    // Create PayPal order
    const orderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: bookingId,
          description: `Payment for ${booking.service_package.title}`,
          amount: {
            currency_code: 'USD',
            value: amount.toString()
          }
        }]
      })
    });
    
    const orderData = await orderResponse.json();
    
    if (orderData.error) {
      throw new Error(orderData.error_description || 'Failed to create PayPal order');
    }
    
    return new Response(
      JSON.stringify(orderData),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});