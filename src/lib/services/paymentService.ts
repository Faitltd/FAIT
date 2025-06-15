import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { supabase } from '../supabase';

// Initialize Stripe
let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface BookingPayment {
  booking_id: string;
  amount: number;
  currency?: string;
  payment_method_id?: string;
  save_payment_method?: boolean;
  metadata?: Record<string, string>;
}

/**
 * Create a payment intent for a booking
 */
export async function createPaymentIntent(paymentData: BookingPayment): Promise<PaymentIntent> {
  try {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        amount: Math.round(paymentData.amount * 100), // Convert to cents
        currency: paymentData.currency || 'usd',
        booking_id: paymentData.booking_id,
        metadata: {
          booking_id: paymentData.booking_id,
          ...paymentData.metadata
        }
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Failed to create payment intent');
  }
}

/**
 * Confirm payment with Stripe
 */
export async function confirmPayment(
  clientSecret: string,
  paymentMethodId: string,
  savePaymentMethod: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = await getStripe();
    if (!stripe) throw new Error('Stripe not loaded');

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethodId,
      setup_future_usage: savePaymentMethod ? 'on_session' : undefined
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (paymentIntent?.status === 'succeeded') {
      return { success: true };
    }

    return { success: false, error: 'Payment not completed' };
  } catch (error) {
    console.error('Error confirming payment:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Payment confirmation failed' 
    };
  }
}

/**
 * Create a setup intent for saving payment methods
 */
export async function createSetupIntent(customerId?: string): Promise<{ client_secret: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('create-setup-intent', {
      body: { customer_id: customerId }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating setup intent:', error);
    throw new Error('Failed to create setup intent');
  }
}

/**
 * Get saved payment methods for a customer
 */
export async function getPaymentMethods(customerId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase.functions.invoke('get-payment-methods', {
      body: { customer_id: customerId }
    });

    if (error) throw error;
    return data.payment_methods || [];
  } catch (error) {
    console.error('Error getting payment methods:', error);
    return [];
  }
}

/**
 * Process refund for a booking
 */
export async function processRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: string
): Promise<{ success: boolean; refund_id?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('process-refund', {
      body: {
        payment_intent_id: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents
        reason
      }
    });

    if (error) throw error;
    return { success: true, refund_id: data.refund_id };
  } catch (error) {
    console.error('Error processing refund:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Refund failed' 
    };
  }
}

/**
 * Update booking payment status
 */
export async function updateBookingPaymentStatus(
  bookingId: string,
  status: 'pending' | 'paid' | 'failed' | 'refunded',
  paymentIntentId?: string,
  transactionId?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({
        payment_status: status,
        payment_intent_id: paymentIntentId,
        transaction_id: transactionId,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating booking payment status:', error);
    throw error;
  }
}

/**
 * Calculate booking total with fees
 */
export function calculateBookingTotal(
  baseAmount: number,
  serviceFeeRate: number = 0.029, // 2.9% service fee
  processingFee: number = 0.30 // $0.30 processing fee
): {
  subtotal: number;
  serviceFee: number;
  processingFee: number;
  total: number;
} {
  const subtotal = baseAmount;
  const serviceFee = Math.round((subtotal * serviceFeeRate) * 100) / 100;
  const total = subtotal + serviceFee + processingFee;

  return {
    subtotal,
    serviceFee,
    processingFee,
    total: Math.round(total * 100) / 100
  };
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(amount: number): { valid: boolean; error?: string } {
  if (amount < 0.50) {
    return { valid: false, error: 'Minimum payment amount is $0.50' };
  }
  
  if (amount > 999999.99) {
    return { valid: false, error: 'Maximum payment amount is $999,999.99' };
  }
  
  return { valid: true };
}

export { getStripe };
