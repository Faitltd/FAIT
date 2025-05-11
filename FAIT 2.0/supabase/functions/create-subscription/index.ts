import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import Stripe from 'npm:stripe@12.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Initialize Stripe with the secret key
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '');

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

    // Parse request body
    const { priceId, paymentMethodId, customerId } = await req.json();

    if (!priceId || !paymentMethodId) {
      throw new Error('Missing required parameters: priceId and paymentMethodId are required');
    }

    let customer;
    
    // Get or create customer
    if (customerId) {
      customer = await stripe.customers.retrieve(customerId);
    } else {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Create a new customer if one doesn't exist
      if (!profile.stripe_customer_id) {
        customer = await stripe.customers.create({
          email: user.email,
          name: `${profile.first_name} ${profile.last_name}`,
          metadata: {
            user_id: user.id
          }
        });

        // Update user profile with Stripe customer ID
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customer.id })
          .eq('id', user.id);
      } else {
        customer = await stripe.customers.retrieve(profile.stripe_customer_id);
      }
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        user_id: user.id
      }
    });

    // Get the plan details
    const { data: plan, error: planError } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('stripe_price_id', priceId)
      .single();

    if (planError) throw planError;

    // Record subscription in database
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        status: subscription.status,
        stripe_subscription_id: subscription.id,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end
      });

    if (subscriptionError) throw subscriptionError;

    // Update user role based on plan
    if (plan.user_role) {
      const { error: updateRoleError } = await supabase
        .from('profiles')
        .update({ user_role: plan.user_role })
        .eq('id', user.id);

      if (updateRoleError) throw updateRoleError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        subscription,
        clientSecret: subscription.latest_invoice.payment_intent?.client_secret
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error(`Error in create-subscription function: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
