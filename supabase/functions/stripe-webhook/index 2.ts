import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import Stripe from 'npm:stripe@12.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Initialize Stripe with the secret key
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '');
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature');
    if (!signature || !STRIPE_WEBHOOK_SECRET) {
      throw new Error('Missing Stripe signature or webhook secret');
    }

    // Get the raw request body
    const body = await req.text();

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Process different webhook events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutSessionCompleted(supabase, session);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        await handleInvoicePaymentSucceeded(supabase, invoice);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await handleInvoicePaymentFailed(supabase, invoice);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(supabase, subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }
      default: {
        console.log(`Unhandled event type: ${event.type}`);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});

// Handler for checkout.session.completed event
async function handleCheckoutSessionCompleted(supabase, session) {
  // Get the customer and subscription details
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  if (!subscriptionId) {
    console.log('No subscription ID in checkout session');
    return;
  }

  try {
    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const product = await stripe.products.retrieve(subscription.items.data[0].price.product);
    const price = subscription.items.data[0].price;

    // Get user ID from metadata
    const userId = session.client_reference_id || session.metadata?.user_id;
    if (!userId) {
      throw new Error('No user ID found in session metadata');
    }

    // Get plan details
    const planName = product.name;
    const planPrice = price.unit_amount / 100; // Convert from cents to dollars
    const billingCycle = price.recurring.interval === 'year' ? 'annual' : 'monthly';

    // Calculate end date for subscription
    const startDate = new Date(subscription.current_period_start * 1000);
    const endDate = new Date(subscription.current_period_end * 1000);

    // Update user's subscription_id in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ subscription_id: subscriptionId })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }

    // Create subscription record
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_name: planName,
        plan_price: planPrice,
        billing_cycle: billingCycle,
        stripe_subscription_id: subscriptionId,
        active: true,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });

    if (subscriptionError) {
      console.error('Error creating subscription record:', subscriptionError);
    }

    // If this is a Co-op Membership subscription, update membership_status
    if (planName === 'Annual Membership Fee' || planName.includes('Contractor')) {
      const { error: membershipError } = await supabase
        .from('profiles')
        .update({ membership_status: true })
        .eq('id', userId);

      if (membershipError) {
        console.error('Error updating membership status:', membershipError);
      }
    }

    // Create notification for user
    await createSubscriptionNotification(supabase, userId, 'Subscription Activated', 
      `Your ${planName} subscription has been activated successfully.`);

  } catch (error) {
    console.error('Error in handleCheckoutSessionCompleted:', error);
  }
}

// Handler for invoice.payment_succeeded event
async function handleInvoicePaymentSucceeded(supabase, invoice) {
  if (!invoice.subscription) {
    console.log('No subscription in invoice');
    return;
  }

  try {
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const customerId = invoice.customer;

    // Find the user with this subscription
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', invoice.subscription)
      .single();

    if (subscriptionError || !subscriptionData) {
      console.error('Error finding subscription:', subscriptionError);
      return;
    }

    const userId = subscriptionData.user_id;

    // Update subscription end date
    const endDate = new Date(subscription.current_period_end * 1000);
    
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        active: true,
        end_date: endDate.toISOString().split('T')[0]
      })
      .eq('stripe_subscription_id', invoice.subscription);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
    }

    // Create notification for user
    await createSubscriptionNotification(supabase, userId, 'Payment Successful', 
      'Your subscription payment was processed successfully.');

  } catch (error) {
    console.error('Error in handleInvoicePaymentSucceeded:', error);
  }
}

// Handler for invoice.payment_failed event
async function handleInvoicePaymentFailed(supabase, invoice) {
  if (!invoice.subscription) {
    console.log('No subscription in invoice');
    return;
  }

  try {
    // Find the user with this subscription
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('user_id, plan_name')
      .eq('stripe_subscription_id', invoice.subscription)
      .single();

    if (subscriptionError || !subscriptionData) {
      console.error('Error finding subscription:', subscriptionError);
      return;
    }

    const userId = subscriptionData.user_id;
    const planName = subscriptionData.plan_name;

    // Create notification for user
    await createSubscriptionNotification(supabase, userId, 'Payment Failed', 
      `Your payment for the ${planName} subscription failed. Please update your payment method.`);

    // Note: We don't immediately deactivate the subscription - Stripe will retry and there's a grace period

  } catch (error) {
    console.error('Error in handleInvoicePaymentFailed:', error);
  }
}

// Handler for customer.subscription.updated event
async function handleSubscriptionUpdated(supabase, subscription) {
  try {
    // Find the user with this subscription
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('user_id, plan_name')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (subscriptionError) {
      console.error('Error finding subscription:', subscriptionError);
      return;
    }

    const userId = subscriptionData.user_id;
    const oldPlanName = subscriptionData.plan_name;

    // Get updated subscription details from Stripe
    const product = await stripe.products.retrieve(subscription.items.data[0].price.product);
    const price = subscription.items.data[0].price;
    const newPlanName = product.name;
    const planPrice = price.unit_amount / 100;
    const billingCycle = price.recurring.interval === 'year' ? 'annual' : 'monthly';
    const startDate = new Date(subscription.current_period_start * 1000);
    const endDate = new Date(subscription.current_period_end * 1000);
    const active = subscription.status === 'active' || subscription.status === 'trialing';

    // Update subscription record
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        plan_name: newPlanName,
        plan_price: planPrice,
        billing_cycle: billingCycle,
        active: active,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      })
      .eq('stripe_subscription_id', subscription.id);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
    }

    // If plan changed, create notification
    if (oldPlanName !== newPlanName) {
      await createSubscriptionNotification(supabase, userId, 'Subscription Updated', 
        `Your subscription has been updated from ${oldPlanName} to ${newPlanName}.`);
    }

  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error);
  }
}

// Handler for customer.subscription.deleted event
async function handleSubscriptionDeleted(supabase, subscription) {
  try {
    // Find the user with this subscription
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('user_id, plan_name')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (subscriptionError) {
      console.error('Error finding subscription:', subscriptionError);
      return;
    }

    const userId = subscriptionData.user_id;
    const planName = subscriptionData.plan_name;

    // Update subscription record
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        active: false,
        end_date: new Date().toISOString().split('T')[0]
      })
      .eq('stripe_subscription_id', subscription.id);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
    }

    // If this was a Co-op Membership subscription, update membership_status
    if (planName === 'Annual Membership Fee' || planName.includes('Contractor')) {
      const { error: membershipError } = await supabase
        .from('profiles')
        .update({ membership_status: false })
        .eq('id', userId);

      if (membershipError) {
        console.error('Error updating membership status:', membershipError);
      }
    }

    // Create notification for user
    await createSubscriptionNotification(supabase, userId, 'Subscription Cancelled', 
      `Your ${planName} subscription has been cancelled.`);

  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error);
  }
}

// Helper function to create a notification
async function createSubscriptionNotification(supabase, userId, title, message) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: title,
        message: message,
        type: 'payment',
        is_read: false
      });

    if (error) {
      console.error('Error creating notification:', error);
    }
  } catch (error) {
    console.error('Error in createSubscriptionNotification:', error);
  }
}
