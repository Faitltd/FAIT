import { supabase } from '../supabase';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_frequency: 'monthly' | 'quarterly' | 'annual';
  features: Record<string, any>;
  user_role: string;
  stripe_price_id: string;
}

interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  stripe_subscription_id: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  plan?: MembershipPlan;
}

interface PaymentMethod {
  id: string;
  user_id: string;
  stripe_payment_method_id: string;
  card_brand?: string;
  card_last4?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  is_default: boolean;
}

interface PaymentTransaction {
  id: string;
  user_id: string;
  subscription_id?: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  stripe_payment_intent_id?: string;
  stripe_invoice_id?: string;
  payment_method_id?: string;
  description?: string;
  created_at: string;
}

/**
 * Get available membership plans
 */
export const getMembershipPlans = async (userRole?: string): Promise<MembershipPlan[]> => {
  try {
    let query = supabase
      .from('membership_plans')
      .select('*')
      .eq('is_active', true);
      
    if (userRole) {
      query = query.or(`user_role.eq.${userRole},user_role.eq.all`);
    }
    
    const { data, error } = await query.order('price', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching membership plans:', error);
    throw new Error('Failed to fetch membership plans');
  }
};

/**
 * Get user's current subscription
 */
export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:plan_id(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    throw new Error('Failed to fetch user subscription');
  }
};

/**
 * Get user's payment methods
 */
export const getPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw new Error('Failed to fetch payment methods');
  }
};

/**
 * Get user's payment transactions
 */
export const getPaymentTransactions = async (userId: string): Promise<PaymentTransaction[]> => {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select(`
        *,
        payment_method:payment_method_id(card_brand, card_last4),
        subscription:subscription_id(plan_id(*))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching payment transactions:', error);
    throw new Error('Failed to fetch payment transactions');
  }
};

/**
 * Create a Stripe checkout session for subscription
 */
export const createCheckoutSession = async (
  userId: string,
  planId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> => {
  try {
    // Get user profile to check if they already have a Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      throw profileError;
    }
    
    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('id', planId)
      .single();
      
    if (planError) {
      throw planError;
    }
    
    // Create checkout session via serverless function
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: plan.stripe_price_id,
        customerId: profile.stripe_customer_id,
        userId,
        planId,
        successUrl,
        cancelUrl,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }
    
    const { sessionId } = await response.json();
    
    // Redirect to Stripe Checkout
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Failed to load Stripe');
    }
    
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });
    
    if (error) {
      throw error;
    }
    
    return sessionId;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
};

/**
 * Cancel a subscription
 */
export const cancelSubscription = async (subscriptionId: string): Promise<void> => {
  try {
    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
};

/**
 * Update default payment method
 */
export const updateDefaultPaymentMethod = async (
  userId: string,
  paymentMethodId: string
): Promise<void> => {
  try {
    // First, set all payment methods to non-default
    const { error: resetError } = await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId);
      
    if (resetError) {
      throw resetError;
    }
    
    // Then set the selected one as default
    const { error: updateError } = await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', paymentMethodId)
      .eq('user_id', userId);
      
    if (updateError) {
      throw updateError;
    }
  } catch (error) {
    console.error('Error updating default payment method:', error);
    throw new Error('Failed to update default payment method');
  }
};

/**
 * Delete a payment method
 */
export const deletePaymentMethod = async (
  userId: string,
  paymentMethodId: string
): Promise<void> => {
  try {
    // Check if this is the default payment method
    const { data, error: checkError } = await supabase
      .from('payment_methods')
      .select('is_default, stripe_payment_method_id')
      .eq('id', paymentMethodId)
      .eq('user_id', userId)
      .single();
      
    if (checkError) {
      throw checkError;
    }
    
    if (data.is_default) {
      throw new Error('Cannot delete default payment method');
    }
    
    // Delete from Stripe first
    const response = await fetch('/api/delete-payment-method', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethodId: data.stripe_payment_method_id,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete payment method from Stripe');
    }
    
    // Then delete from our database
    const { error: deleteError } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', paymentMethodId)
      .eq('user_id', userId);
      
    if (deleteError) {
      throw deleteError;
    }
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw new Error('Failed to delete payment method');
  }
};

/**
 * Create a setup intent for adding a new payment method
 */
export const createSetupIntent = async (userId: string): Promise<string> => {
  try {
    // Get user profile to check if they already have a Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      throw profileError;
    }
    
    // Create setup intent via serverless function
    const response = await fetch('/api/create-setup-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId: profile.stripe_customer_id,
        userId,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create setup intent');
    }
    
    const { clientSecret } = await response.json();
    return clientSecret;
  } catch (error) {
    console.error('Error creating setup intent:', error);
    throw new Error('Failed to create setup intent');
  }
};
