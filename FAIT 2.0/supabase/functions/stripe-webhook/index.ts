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

    // Handle the event
    switch (event.type) {
      case 'account.updated':
        await handleAccountUpdated(supabase, event.data.object);
        break;
      case 'account.application.authorized':
        await handleAccountApplicationAuthorized(supabase, event.data.object);
        break;
      case 'account.application.deauthorized':
        await handleAccountApplicationDeauthorized(supabase, event.data.object);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(supabase, event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(supabase, event.data.object);
        break;
      case 'charge.succeeded':
        await handleChargeSucceeded(supabase, event.data.object);
        break;
      case 'charge.failed':
        await handleChargeFailed(supabase, event.data.object);
        break;
      case 'payout.created':
        await handlePayoutCreated(supabase, event.data.object);
        break;
      case 'payout.paid':
        await handlePayoutPaid(supabase, event.data.object);
        break;
      case 'payout.failed':
        await handlePayoutFailed(supabase, event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error(`Error in stripe-webhook function: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});

/**
 * Handle account.updated event
 */
async function handleAccountUpdated(supabase, account) {
  try {
    // Find the user with this Stripe Connect account ID
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_connect_id', account.id);

    if (profilesError) throw profilesError;
    if (!profiles || profiles.length === 0) {
      console.log(`No user found with Stripe Connect account ID: ${account.id}`);
      return;
    }

    const userId = profiles[0].id;

    // Update the user's Stripe Connect status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        stripe_connect_status: account.details_submitted ? 'complete' : 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Create a notification for the user
    await createNotification(
      supabase,
      userId,
      'Account Updated',
      'Your Stripe Connect account has been updated.',
      'stripe_connect',
      account.id
    );
  } catch (error) {
    console.error('Error in handleAccountUpdated:', error);
  }
}

/**
 * Handle account.application.authorized event
 */
async function handleAccountApplicationAuthorized(supabase, account) {
  try {
    // Find the user with this Stripe Connect account ID
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_connect_id', account.id);

    if (profilesError) throw profilesError;
    if (!profiles || profiles.length === 0) {
      console.log(`No user found with Stripe Connect account ID: ${account.id}`);
      return;
    }

    const userId = profiles[0].id;

    // Create a notification for the user
    await createNotification(
      supabase,
      userId,
      'Account Authorized',
      'Your Stripe Connect account has been authorized.',
      'stripe_connect',
      account.id
    );
  } catch (error) {
    console.error('Error in handleAccountApplicationAuthorized:', error);
  }
}

/**
 * Handle account.application.deauthorized event
 */
async function handleAccountApplicationDeauthorized(supabase, account) {
  try {
    // Find the user with this Stripe Connect account ID
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_connect_id', account.id);

    if (profilesError) throw profilesError;
    if (!profiles || profiles.length === 0) {
      console.log(`No user found with Stripe Connect account ID: ${account.id}`);
      return;
    }

    const userId = profiles[0].id;

    // Create a notification for the user
    await createNotification(
      supabase,
      userId,
      'Account Deauthorized',
      'Your Stripe Connect account has been deauthorized.',
      'stripe_connect',
      account.id
    );
  } catch (error) {
    console.error('Error in handleAccountApplicationDeauthorized:', error);
  }
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentIntentSucceeded(supabase, paymentIntent) {
  try {
    // Check if this payment is for a booking
    if (paymentIntent.metadata && paymentIntent.metadata.booking_id) {
      const bookingId = paymentIntent.metadata.booking_id;
      
      // Update the booking payment status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Get the booking details to notify the contractor
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*, client:profiles!client_id(*), contractor:profiles!contractor_id(*)')
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;

      // Notify the contractor
      if (booking.contractor_id) {
        await createNotification(
          supabase,
          booking.contractor_id,
          'Payment Received',
          `Payment for booking #${bookingId} has been received.`,
          'booking_payment',
          bookingId
        );
      }

      // Notify the client
      if (booking.client_id) {
        await createNotification(
          supabase,
          booking.client_id,
          'Payment Successful',
          `Your payment for booking #${bookingId} was successful.`,
          'booking_payment',
          bookingId
        );
      }
    }
  } catch (error) {
    console.error('Error in handlePaymentIntentSucceeded:', error);
  }
}

/**
 * Handle payment_intent.payment_failed event
 */
async function handlePaymentIntentFailed(supabase, paymentIntent) {
  try {
    // Check if this payment is for a booking
    if (paymentIntent.metadata && paymentIntent.metadata.booking_id) {
      const bookingId = paymentIntent.metadata.booking_id;
      
      // Update the booking payment status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Get the booking details to notify the client
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*, client:profiles!client_id(*)')
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;

      // Notify the client
      if (booking.client_id) {
        await createNotification(
          supabase,
          booking.client_id,
          'Payment Failed',
          `Your payment for booking #${bookingId} failed. Please update your payment method.`,
          'booking_payment',
          bookingId
        );
      }
    }
  } catch (error) {
    console.error('Error in handlePaymentIntentFailed:', error);
  }
}

/**
 * Handle charge.succeeded event
 */
async function handleChargeSucceeded(supabase, charge) {
  // Implementation depends on your business logic
  console.log('Charge succeeded:', charge.id);
}

/**
 * Handle charge.failed event
 */
async function handleChargeFailed(supabase, charge) {
  // Implementation depends on your business logic
  console.log('Charge failed:', charge.id);
}

/**
 * Handle payout.created event
 */
async function handlePayoutCreated(supabase, payout) {
  try {
    // Check if this is a Connect payout
    if (payout.destination) {
      // Find the user with this Stripe Connect account ID
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_connect_id', payout.destination);

      if (profilesError) throw profilesError;
      if (!profiles || profiles.length === 0) {
        console.log(`No user found with Stripe Connect account ID: ${payout.destination}`);
        return;
      }

      const userId = profiles[0].id;

      // Update the payout status in the database
      const { data: existingPayout, error: existingPayoutError } = await supabase
        .from('payouts')
        .select('id')
        .eq('stripe_payout_id', payout.id);

      if (existingPayoutError) throw existingPayoutError;

      if (!existingPayout || existingPayout.length === 0) {
        // Create a new payout record
        const { error: insertError } = await supabase
          .from('payouts')
          .insert({
            user_id: userId,
            stripe_payout_id: payout.id,
            amount: payout.amount / 100, // Convert from cents
            currency: payout.currency,
            status: payout.status,
            arrival_date: new Date(payout.arrival_date * 1000).toISOString()
          });

        if (insertError) throw insertError;
      } else {
        // Update the existing payout record
        const { error: updateError } = await supabase
          .from('payouts')
          .update({
            status: payout.status,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_payout_id', payout.id);

        if (updateError) throw updateError;
      }

      // Create a notification for the user
      await createNotification(
        supabase,
        userId,
        'Payout Created',
        `A payout of ${(payout.amount / 100).toLocaleString('en-US', { style: 'currency', currency: payout.currency })} has been initiated to your bank account.`,
        'payout',
        payout.id
      );
    }
  } catch (error) {
    console.error('Error in handlePayoutCreated:', error);
  }
}

/**
 * Handle payout.paid event
 */
async function handlePayoutPaid(supabase, payout) {
  try {
    // Check if this is a Connect payout
    if (payout.destination) {
      // Find the user with this Stripe Connect account ID
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_connect_id', payout.destination);

      if (profilesError) throw profilesError;
      if (!profiles || profiles.length === 0) {
        console.log(`No user found with Stripe Connect account ID: ${payout.destination}`);
        return;
      }

      const userId = profiles[0].id;

      // Update the payout status in the database
      const { error: updateError } = await supabase
        .from('payouts')
        .update({
          status: payout.status,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_payout_id', payout.id);

      if (updateError) throw updateError;

      // Create a notification for the user
      await createNotification(
        supabase,
        userId,
        'Payout Completed',
        `Your payout of ${(payout.amount / 100).toLocaleString('en-US', { style: 'currency', currency: payout.currency })} has been deposited to your bank account.`,
        'payout',
        payout.id
      );
    }
  } catch (error) {
    console.error('Error in handlePayoutPaid:', error);
  }
}

/**
 * Handle payout.failed event
 */
async function handlePayoutFailed(supabase, payout) {
  try {
    // Check if this is a Connect payout
    if (payout.destination) {
      // Find the user with this Stripe Connect account ID
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_connect_id', payout.destination);

      if (profilesError) throw profilesError;
      if (!profiles || profiles.length === 0) {
        console.log(`No user found with Stripe Connect account ID: ${payout.destination}`);
        return;
      }

      const userId = profiles[0].id;

      // Update the payout status in the database
      const { error: updateError } = await supabase
        .from('payouts')
        .update({
          status: payout.status,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_payout_id', payout.id);

      if (updateError) throw updateError;

      // Create a notification for the user
      await createNotification(
        supabase,
        userId,
        'Payout Failed',
        `Your payout of ${(payout.amount / 100).toLocaleString('en-US', { style: 'currency', currency: payout.currency })} has failed. Please check your bank account details.`,
        'payout',
        payout.id
      );
    }
  } catch (error) {
    console.error('Error in handlePayoutFailed:', error);
  }
}

/**
 * Create a notification for a user
 */
async function createNotification(supabase, userId, title, message, type, relatedId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        related_id: relatedId,
        read: false
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}
