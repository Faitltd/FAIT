// Stripe webhook handler
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Handle Stripe webhook events
 */
exports.handler = async (event) => {
  try {
    // Verify the webhook signature
    const stripeSignature = event.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let stripeEvent;
    
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        event.body,
        stripeSignature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid signature' }),
      };
    }
    
    // Handle different event types
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(stripeEvent.data.object);
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(stripeEvent.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(stripeEvent.data.object);
        break;
        
      case 'payment_method.attached':
        await handlePaymentMethodAttached(stripeEvent.data.object);
        break;
        
      case 'payment_method.detached':
        await handlePaymentMethodDetached(stripeEvent.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Error handling webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(session) {
  try {
    // Get the customer and subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    // Get metadata from the session
    const userId = session.metadata.userId;
    const planId = session.metadata.planId;
    
    if (!userId || !planId) {
      console.error('Missing metadata in checkout session:', session.id);
      return;
    }
    
    // Update or create user subscription
    const { data: existingSubscription, error: checkError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing subscription:', checkError);
      return;
    }
    
    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          plan_id: planId,
          status: subscription.status,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSubscription.id);
        
      if (updateError) {
        console.error('Error updating subscription:', updateError);
        return;
      }
    } else {
      // Create new subscription
      const { error: insertError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          status: subscription.status,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        });
        
      if (insertError) {
        console.error('Error creating subscription:', insertError);
        return;
      }
    }
    
    // Update user profile with Stripe customer ID and membership status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        stripe_customer_id: subscription.customer,
        membership_status: 'active',
        membership_start_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
      
    if (profileError) {
      console.error('Error updating profile:', profileError);
      return;
    }
    
    console.log('Successfully processed checkout session:', session.id);
  } catch (error) {
    console.error('Error handling checkout.session.completed:', error);
    throw error;
  }
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription) {
  try {
    // Find the subscription in our database
    const { data: subscriptionData, error: findError } = await supabase
      .from('user_subscriptions')
      .select('id, user_id')
      .eq('stripe_subscription_id', subscription.id)
      .maybeSingle();
      
    if (findError) {
      console.error('Error finding subscription:', findError);
      return;
    }
    
    if (!subscriptionData) {
      console.error('Subscription not found:', subscription.id);
      return;
    }
    
    // Update the subscription
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at 
          ? new Date(subscription.canceled_at * 1000).toISOString() 
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionData.id);
      
    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return;
    }
    
    // Update user profile membership status if needed
    if (subscription.status === 'active') {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          membership_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionData.user_id);
        
      if (profileError) {
        console.error('Error updating profile:', profileError);
        return;
      }
    } else if (['canceled', 'unpaid', 'incomplete_expired'].includes(subscription.status)) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          membership_status: 'inactive',
          membership_end_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionData.user_id);
        
      if (profileError) {
        console.error('Error updating profile:', profileError);
        return;
      }
    }
    
    console.log('Successfully updated subscription:', subscription.id);
  } catch (error) {
    console.error('Error handling customer.subscription.updated:', error);
    throw error;
  }
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription) {
  try {
    // Find the subscription in our database
    const { data: subscriptionData, error: findError } = await supabase
      .from('user_subscriptions')
      .select('id, user_id')
      .eq('stripe_subscription_id', subscription.id)
      .maybeSingle();
      
    if (findError) {
      console.error('Error finding subscription:', findError);
      return;
    }
    
    if (!subscriptionData) {
      console.error('Subscription not found:', subscription.id);
      return;
    }
    
    // Update the subscription
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionData.id);
      
    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return;
    }
    
    // Update user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        membership_status: 'inactive',
        membership_end_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionData.user_id);
      
    if (profileError) {
      console.error('Error updating profile:', profileError);
      return;
    }
    
    console.log('Successfully processed subscription deletion:', subscription.id);
  } catch (error) {
    console.error('Error handling customer.subscription.deleted:', error);
    throw error;
  }
}

/**
 * Handle invoice.payment_succeeded event
 */
async function handleInvoicePaymentSucceeded(invoice) {
  try {
    // Only process subscription invoices
    if (!invoice.subscription) {
      return;
    }
    
    // Find the subscription in our database
    const { data: subscriptionData, error: findError } = await supabase
      .from('user_subscriptions')
      .select('id, user_id')
      .eq('stripe_subscription_id', invoice.subscription)
      .maybeSingle();
      
    if (findError) {
      console.error('Error finding subscription:', findError);
      return;
    }
    
    if (!subscriptionData) {
      console.error('Subscription not found:', invoice.subscription);
      return;
    }
    
    // Record the payment transaction
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: subscriptionData.user_id,
        subscription_id: subscriptionData.id,
        amount: invoice.amount_paid / 100, // Convert from cents
        currency: invoice.currency,
        status: 'succeeded',
        stripe_invoice_id: invoice.id,
        stripe_payment_intent_id: invoice.payment_intent,
        description: `Payment for invoice ${invoice.number || invoice.id}`,
      });
      
    if (transactionError) {
      console.error('Error recording payment transaction:', transactionError);
      return;
    }
    
    console.log('Successfully processed invoice payment:', invoice.id);
  } catch (error) {
    console.error('Error handling invoice.payment_succeeded:', error);
    throw error;
  }
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(invoice) {
  try {
    // Only process subscription invoices
    if (!invoice.subscription) {
      return;
    }
    
    // Find the subscription in our database
    const { data: subscriptionData, error: findError } = await supabase
      .from('user_subscriptions')
      .select('id, user_id')
      .eq('stripe_subscription_id', invoice.subscription)
      .maybeSingle();
      
    if (findError) {
      console.error('Error finding subscription:', findError);
      return;
    }
    
    if (!subscriptionData) {
      console.error('Subscription not found:', invoice.subscription);
      return;
    }
    
    // Record the failed payment transaction
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: subscriptionData.user_id,
        subscription_id: subscriptionData.id,
        amount: invoice.amount_due / 100, // Convert from cents
        currency: invoice.currency,
        status: 'failed',
        stripe_invoice_id: invoice.id,
        stripe_payment_intent_id: invoice.payment_intent,
        description: `Failed payment for invoice ${invoice.number || invoice.id}`,
      });
      
    if (transactionError) {
      console.error('Error recording failed payment transaction:', transactionError);
      return;
    }
    
    console.log('Successfully processed failed invoice payment:', invoice.id);
  } catch (error) {
    console.error('Error handling invoice.payment_failed:', error);
    throw error;
  }
}

/**
 * Handle payment_method.attached event
 */
async function handlePaymentMethodAttached(paymentMethod) {
  try {
    // Get the customer
    const customer = await stripe.customers.retrieve(paymentMethod.customer);
    
    // Find the user with this Stripe customer ID
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customer.id)
      .maybeSingle();
      
    if (userError) {
      console.error('Error finding user:', userError);
      return;
    }
    
    if (!userData) {
      console.error('User not found for customer:', customer.id);
      return;
    }
    
    // Check if this payment method already exists
    const { data: existingMethod, error: checkError } = await supabase
      .from('payment_methods')
      .select('id')
      .eq('stripe_payment_method_id', paymentMethod.id)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing payment method:', checkError);
      return;
    }
    
    // Get card details if it's a card payment method
    let cardDetails = {};
    if (paymentMethod.type === 'card' && paymentMethod.card) {
      cardDetails = {
        card_brand: paymentMethod.card.brand,
        card_last4: paymentMethod.card.last4,
        card_exp_month: paymentMethod.card.exp_month,
        card_exp_year: paymentMethod.card.exp_year,
      };
    }
    
    if (existingMethod) {
      // Update existing payment method
      const { error: updateError } = await supabase
        .from('payment_methods')
        .update({
          ...cardDetails,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingMethod.id);
        
      if (updateError) {
        console.error('Error updating payment method:', updateError);
        return;
      }
    } else {
      // Check if this is the first payment method for the user
      const { data: paymentMethods, error: countError } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('user_id', userData.id);
        
      if (countError) {
        console.error('Error counting payment methods:', countError);
        return;
      }
      
      // Insert new payment method
      const { error: insertError } = await supabase
        .from('payment_methods')
        .insert({
          user_id: userData.id,
          stripe_payment_method_id: paymentMethod.id,
          ...cardDetails,
          is_default: paymentMethods.length === 0, // Make default if it's the first one
        });
        
      if (insertError) {
        console.error('Error inserting payment method:', insertError);
        return;
      }
    }
    
    console.log('Successfully processed payment method attachment:', paymentMethod.id);
  } catch (error) {
    console.error('Error handling payment_method.attached:', error);
    throw error;
  }
}

/**
 * Handle payment_method.detached event
 */
async function handlePaymentMethodDetached(paymentMethod) {
  try {
    // Delete the payment method from our database
    const { error: deleteError } = await supabase
      .from('payment_methods')
      .delete()
      .eq('stripe_payment_method_id', paymentMethod.id);
      
    if (deleteError) {
      console.error('Error deleting payment method:', deleteError);
      return;
    }
    
    console.log('Successfully processed payment method detachment:', paymentMethod.id);
  } catch (error) {
    console.error('Error handling payment_method.detached:', error);
    throw error;
  }
}
