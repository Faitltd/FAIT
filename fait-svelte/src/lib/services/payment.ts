/**
 * Payment Service
 * 
 * This module provides a centralized payment service for processing payments.
 * It integrates with Stripe for payment processing.
 */

import { supabase } from './supabase';
import type { ApiError } from './api';

// Payment method type
export type PaymentMethod = {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  createdAt: string;
};

// Payment intent type
export type PaymentIntent = {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  clientSecret: string;
  createdAt: string;
};

// Payment type
export type Payment = {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  paymentMethodId: string;
  paymentIntentId: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Process API response
 * @param response API response
 * @returns Processed data
 * @throws ApiError if response contains an error
 */
const processResponse = <T>(response: { data: T | null; error: any }) => {
  if (response.error) {
    console.error('Payment API Error:', response.error);
    throw {
      message: response.error.message || 'An error occurred',
      status: response.error.status || 500,
      data: response.error
    };
  }
  return response.data;
};

/**
 * Payment Service
 */
export const paymentService = {
  /**
   * Get payment methods for a user
   * @param userId User ID
   * @returns List of payment methods
   */
  getPaymentMethods: async (userId: string): Promise<PaymentMethod[]> => {
    try {
      const response = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      return processResponse<any[]>(response).map(method => ({
        id: method.id,
        type: method.type,
        last4: method.last4,
        brand: method.brand,
        expMonth: method.exp_month,
        expYear: method.exp_year,
        isDefault: method.is_default,
        createdAt: method.created_at
      }));
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  },

  /**
   * Add a payment method
   * @param userId User ID
   * @param paymentMethodId Payment method ID from Stripe
   * @returns Added payment method
   */
  addPaymentMethod: async (userId: string, paymentMethodId: string): Promise<PaymentMethod> => {
    try {
      // In a real app, this would call a server endpoint to add the payment method to Stripe
      // For now, we'll simulate the response
      const response = await supabase
        .from('payment_methods')
        .insert({
          user_id: userId,
          payment_method_id: paymentMethodId,
          type: 'card',
          last4: '4242', // Simulated data
          brand: 'visa', // Simulated data
          exp_month: 12, // Simulated data
          exp_year: 2025, // Simulated data
          is_default: false
        })
        .select()
        .single();

      const method = processResponse<any>(response);
      
      return {
        id: method.id,
        type: method.type,
        last4: method.last4,
        brand: method.brand,
        expMonth: method.exp_month,
        expYear: method.exp_year,
        isDefault: method.is_default,
        createdAt: method.created_at
      };
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  },

  /**
   * Set default payment method
   * @param userId User ID
   * @param paymentMethodId Payment method ID
   * @returns Updated payment method
   */
  setDefaultPaymentMethod: async (userId: string, paymentMethodId: string): Promise<PaymentMethod> => {
    try {
      // First, set all payment methods to non-default
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Then, set the selected payment method as default
      const response = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', paymentMethodId)
        .eq('user_id', userId)
        .select()
        .single();

      const method = processResponse<any>(response);
      
      return {
        id: method.id,
        type: method.type,
        last4: method.last4,
        brand: method.brand,
        expMonth: method.exp_month,
        expYear: method.exp_year,
        isDefault: method.is_default,
        createdAt: method.created_at
      };
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  },

  /**
   * Remove a payment method
   * @param userId User ID
   * @param paymentMethodId Payment method ID
   */
  removePaymentMethod: async (userId: string, paymentMethodId: string): Promise<void> => {
    try {
      const response = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentMethodId)
        .eq('user_id', userId);

      processResponse(response);
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  },

  /**
   * Create a payment intent
   * @param bookingId Booking ID
   * @param amount Amount in cents
   * @param currency Currency code
   * @returns Payment intent
   */
  createPaymentIntent: async (bookingId: string, amount: number, currency = 'usd'): Promise<PaymentIntent> => {
    try {
      // In a real app, this would call a server endpoint to create a payment intent in Stripe
      // For now, we'll simulate the response
      const response = await supabase
        .from('payment_intents')
        .insert({
          booking_id: bookingId,
          amount,
          currency,
          status: 'requires_payment_method',
          client_secret: `pi_${Math.random().toString(36).substring(2)}_secret_${Math.random().toString(36).substring(2)}`
        })
        .select()
        .single();

      const intent = processResponse<any>(response);
      
      return {
        id: intent.id,
        amount: intent.amount,
        currency: intent.currency,
        status: intent.status,
        clientSecret: intent.client_secret,
        createdAt: intent.created_at
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  /**
   * Process a payment
   * @param bookingId Booking ID
   * @param paymentMethodId Payment method ID
   * @param amount Amount in cents
   * @param currency Currency code
   * @returns Payment
   */
  processPayment: async (bookingId: string, paymentMethodId: string, amount: number, currency = 'usd'): Promise<Payment> => {
    try {
      // In a real app, this would call a server endpoint to process the payment in Stripe
      // For now, we'll simulate the response
      const response = await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          payment_method_id: paymentMethodId,
          amount,
          currency,
          status: 'succeeded',
          payment_intent_id: `pi_${Math.random().toString(36).substring(2)}`,
          receipt_url: `https://receipt.stripe.com/${Math.random().toString(36).substring(2)}`
        })
        .select()
        .single();

      const payment = processResponse<any>(response);
      
      return {
        id: payment.id,
        bookingId: payment.booking_id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethodId: payment.payment_method_id,
        paymentIntentId: payment.payment_intent_id,
        receiptUrl: payment.receipt_url,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  /**
   * Get payment by booking ID
   * @param bookingId Booking ID
   * @returns Payment
   */
  getPaymentByBookingId: async (bookingId: string): Promise<Payment | null> => {
    try {
      const response = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .single();

      if (response.error && response.error.code === 'PGRST116') {
        // No payment found
        return null;
      }

      const payment = processResponse<any>(response);
      
      return {
        id: payment.id,
        bookingId: payment.booking_id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethodId: payment.payment_method_id,
        paymentIntentId: payment.payment_intent_id,
        receiptUrl: payment.receipt_url,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at
      };
    } catch (error) {
      console.error('Error getting payment:', error);
      throw error;
    }
  }
};
