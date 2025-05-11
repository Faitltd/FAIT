import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import Stripe from 'npm:stripe@12.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Initialize Stripe with the secret key
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '');

// Define price IDs for each plan
// These would be created in the Stripe dashboard and stored here
const PRICE_IDS = {
  'Free Tier': null, // Free tier doesn't need a price ID
  'Pro Contractor': {
    monthly: Deno.env.get('STRIPE_PRICE_PRO_CONTRACTOR_MONTHLY'),
    annual: Deno.env.get('STRIPE_PRICE_PRO_CONTRACTOR_ANNUAL')
  },
  'Business Contractor': {
    monthly: Deno.env.get('STRIPE_PRICE_BUSINESS_CONTRACTOR_MONTHLY'),
    annual: Deno.env.get('STRIPE_PRICE_BUSINESS_CONTRACTOR_ANNUAL')
  },
  'Free Homeowner': null, // Free tier doesn't need a price ID
  'FAIT Plus': {
    monthly: Deno.env.get('STRIPE_PRICE_FAIT_PLUS_MONTHLY'),
    annual: Deno.env.get('STRIPE_PRICE_FAIT_PLUS_ANNUAL')
  },
  'Annual Membership Fee': {
    annual: Deno.env.get('STRIPE_PRICE_MEMBERSHIP_FEE')
  }
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
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
    const { planName, billingCycle, successUrl, cancelUrl } = await req.json();

    // Validate inputs
    if (!planName) throw new Error('Plan name is required');
    if (!billingCycle) throw new Error('Billing cycle is required');
    if (!successUrl) throw new Error('Success URL is required');
    if (!cancelUrl) throw new Error('Cancel URL is required');

    // Check if plan is free
    if (planName === 'Free Tier' || planName === 'Free Homeowner') {
      // For free plans, just create a subscription record without Stripe
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_name: planName,
          plan_price: 0,
          billing_cycle: 'monthly', // Default for free plans
          stripe_subscription_id: 'free_plan',
          active: true,
          start_date: new Date().toISOString().split('T')[0],
          end_date: null // No end date for free plans
        });

      if (subscriptionError) throw subscriptionError;

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Free Plan Activated',
          message: `Your ${planName} has been activated successfully.`,
          type: 'payment',
          is_read: false
        });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Free plan activated',
          redirectUrl: successUrl
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // For paid plans, get the price ID
    const priceId = PRICE_IDS[planName]?.[billingCycle];
    if (!priceId) throw new Error(`Invalid plan or billing cycle: ${planName} - ${billingCycle}`);

    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name, user_type')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: user.id,
      customer_email: profileData.email,
      metadata: {
        user_id: user.id,
        plan_name: planName,
        billing_cycle: billingCycle,
        user_type: profileData.user_type
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        sessionId: session.id,
        checkoutUrl: session.url
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error(`Error creating subscription: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
