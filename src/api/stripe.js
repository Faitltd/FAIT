import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const stripeSecretKey = import.meta.env.VITE_STRIPE_SECRET_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const stripe = new Stripe(stripeSecretKey);

// Product IDs from Stripe dashboard
const PRODUCT_IDS = {
  'basic': 'prod_basic',
  'plus': 'prod_plus',
  'family': 'prod_family',
  'pro': 'prod_pro',
  'business': 'prod_business'
};

export async function createSubscription(userId, planId) {
  try {
    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('email, stripe_customer_id')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    // Create or retrieve Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId }
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }
    
    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: PRODUCT_IDS[planId] }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
    
    // Update user's subscription in database
    await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_subscription_id: subscription.id,
        plan_id: planId,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      });
    
    return {
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

export async function updateSubscription(userId, newPlanId) {
  try {
    // Get user's current subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, plan_id')
      .eq('user_id', userId)
      .single();
    
    if (subError) throw subError;
    
    // Calculate proration
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    );
    
    // Update subscription with new plan
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        items: [{
          id: stripeSubscription.items.data[0].id,
          price: PRODUCT_IDS[newPlanId],
        }],
        proration_behavior: 'always_invoice',
        expand: ['latest_invoice.payment_intent'],
      }
    );
    
    // Update subscription in database
    await supabase
      .from('subscriptions')
      .update({
        plan_id: newPlanId,
        status: updatedSubscription.status,
        current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
      })
      .eq('user_id', userId);
    
    return {
      subscriptionId: updatedSubscription.id,
      clientSecret: updatedSubscription.latest_invoice?.payment_intent?.client_secret,
      proration_amount: updatedSubscription.latest_invoice?.amount_due / 100,
    };
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

export async function cancelSubscription(userId) {
  try {
    // Get user's current subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .single();
    
    if (subError) throw subError;
    
    // Cancel at period end
    await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      { cancel_at_period_end: true }
    );
    
    // Update subscription in database
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceling',
      })
      .eq('user_id', userId);
    
    return { success: true };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

export async function handleWebhook(event) {
  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.created':
      const subscription = event.data.object;
      const customerId = subscription.customer;
      
      // Get user by Stripe customer ID
      const { data: user } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();
      
      if (user) {
        // Update subscription in database
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          });
        
        // Update user permissions based on subscription
        await updateUserPermissions(user.id, subscription.status === 'active');
      }
      break;
      
    case 'customer.subscription.deleted':
      const canceledSubscription = event.data.object;
      const canceledCustomerId = canceledSubscription.customer;
      
      // Get user by Stripe customer ID
      const { data: canceledUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', canceledCustomerId)
        .single();
      
      if (canceledUser) {
        // Update subscription in database
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('stripe_subscription_id', canceledSubscription.id);
        
        // Downgrade user to free plan
        await updateUserPermissions(canceledUser.id, false);
      }
      break;
  }
}

async function updateUserPermissions(userId, isActive) {
  // Get user's subscription plan
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_id')
    .eq('user_id', userId)
    .single();
  
  if (!subscription) return;
  
  // Update user's permissions based on plan
  const planLimits = {
    'basic': { service_limit: 1, featured: false },
    'plus': { service_limit: 5, featured: false },
    'family': { service_limit: 10, featured: true },
    'pro': { service_limit: 20, featured: true },
    'business': { service_limit: 50, featured: true },
  };
  
  const limits = isActive ? planLimits[subscription.plan_id] : planLimits['basic'];
  
  await supabase
    .from('profiles')
    .update({
      subscription_plan: isActive ? subscription.plan_id : 'basic',
      service_limit: limits.service_limit,
      featured_listing: limits.featured,
    })
    .eq('id', userId);
}
