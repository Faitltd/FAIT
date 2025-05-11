import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import Stripe from 'npm:stripe@12.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '');

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
    if (!authHeader) throw new Error('No authorization header');

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) throw new Error('Invalid token');

    const { bookingId, paymentMethodId } = await req.json();
    
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        service_package:service_packages(price)
      `)
      .eq('id', bookingId)
      .single();
      
    if (bookingError) throw bookingError;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.service_package.price * 100),
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        booking_id: bookingId,
        user_id: user.id
      }
    });
    
    await supabase
      .from('bookings')
      .update({
        payment_status: 'paid',
        payment_id: paymentIntent.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);
    
    return new Response(
      JSON.stringify({ success: true, paymentIntent }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
