import { supabase } from '../lib/supabase';

// Define payment status types
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';

// Define payment method types
export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'square';

// Define payment interface
export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  payment_intent_id?: string;
  payment_method_id?: string;
  receipt_url?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// Define payment request interface
export interface PaymentRequest {
  booking_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_method_id?: string;
}

// Define payment service class
class PaymentService {
  // Create a payment intent (preparation for payment)
  async createPaymentIntent(paymentRequest: PaymentRequest): Promise<{ clientSecret: string; paymentIntentId: string }> {
    try {
      // In a real implementation, this would call your backend API
      // which would then create a payment intent with Square or Stripe
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment intent');
      }
      
      const data = await response.json();
      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }
  
  // Process a payment
  async processPayment(paymentIntentId: string): Promise<Payment> {
    try {
      // In a real implementation, this would call your backend API
      // which would then confirm the payment with Square or Stripe
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process payment');
      }
      
      const data = await response.json();
      return data.payment;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }
  
  // Get payment by ID
  async getPayment(paymentId: string): Promise<Payment | null> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting payment:', error);
      return null;
    }
  }
  
  // Get payments for a booking
  async getPaymentsForBooking(bookingId: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error getting payments for booking:', error);
      return [];
    }
  }
  
  // Update booking payment status
  async updateBookingPaymentStatus(bookingId: string, status: PaymentStatus): Promise<void> {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status: status })
        .eq('id', bookingId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating booking payment status:', error);
      throw error;
    }
  }
  
  // Simulate a successful payment (for development/testing)
  async simulatePayment(bookingId: string, amount: number): Promise<Payment> {
    try {
      // Create a payment record
      const { data, error } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          amount,
          currency: 'USD',
          status: 'paid',
          payment_method: 'credit_card',
          payment_intent_id: `sim_${Math.random().toString(36).substring(2, 15)}`,
          receipt_url: '#',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update booking payment status
      await this.updateBookingPaymentStatus(bookingId, 'paid');
      
      return data;
    } catch (error) {
      console.error('Error simulating payment:', error);
      throw error;
    }
  }
  
  // Request a refund
  async requestRefund(paymentId: string, amount?: number): Promise<Payment> {
    try {
      // In a real implementation, this would call your backend API
      // which would then process the refund with Square or Stripe
      const response = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId, amount }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process refund');
      }
      
      const data = await response.json();
      return data.payment;
    } catch (error) {
      console.error('Error requesting refund:', error);
      throw error;
    }
  }
  
  // Simulate a refund (for development/testing)
  async simulateRefund(paymentId: string): Promise<Payment> {
    try {
      // Get the payment
      const { data: payment, error: getError } = await supabase
        .from('payments')
        .select('*, bookings!inner(*)')
        .eq('id', paymentId)
        .single();
      
      if (getError) throw getError;
      
      // Update payment status
      const { data, error } = await supabase
        .from('payments')
        .update({
          status: 'refunded',
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update booking payment status
      await this.updateBookingPaymentStatus(payment.booking_id, 'refunded');
      
      return data;
    } catch (error) {
      console.error('Error simulating refund:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
