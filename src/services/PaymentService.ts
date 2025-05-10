import { supabase } from '../lib/supabase';
import { Invoice, InvoiceStatus } from '../types/invoice';
import { invoiceService } from './invoiceService';

// Define payment status types
export type PaymentStatus = 'unpaid' | 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';

// Define payment method types
export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'square' | 'stripe';

// Define payment processor types
export type PaymentProcessor = 'stripe' | 'square';

// Define payment interface
export interface Payment {
  id: string;
  booking_id?: string;
  project_id?: string;
  invoice_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  payment_processor: PaymentProcessor;
  payment_intent_id?: string;
  payment_method_id?: string;
  receipt_url?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;

  // Joined fields
  booking?: any;
  project?: any;
  invoice?: Invoice;
}

// Define payment request interface
export interface PaymentRequest {
  booking_id?: string;
  project_id?: string;
  invoice_id?: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_processor: PaymentProcessor;
  payment_method_id?: string;
  client_id?: string;
  service_agent_id?: string;
  description?: string;
}

// Define payment service class
class PaymentService {
  // Create a payment intent with Stripe (preparation for payment)
  async createStripePaymentIntent(paymentRequest: PaymentRequest): Promise<{ clientSecret: string; paymentIntentId: string }> {
    try {
      // Get the session for authentication
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Authentication session expired');
      }

      // Call the Stripe payment intent function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(paymentRequest)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId
      };
    } catch (error) {
      console.error('Error creating Stripe payment intent:', error);
      throw error;
    }
  }

  // Legacy method for backward compatibility
  async createPaymentIntent(paymentRequest: PaymentRequest): Promise<{ clientSecret: string; paymentIntentId: string }> {
    // Default to Stripe if not specified
    const updatedRequest = {
      ...paymentRequest,
      payment_processor: paymentRequest.payment_processor || 'stripe'
    };

    return this.createStripePaymentIntent(updatedRequest);
  }

  // Process a payment with Stripe
  async processStripePayment(
    paymentMethodId: string,
    paymentIntentId: string,
    paymentRequest: PaymentRequest
  ): Promise<Payment> {
    try {
      // Get the session for authentication
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Authentication session expired');
      }

      // Call the Stripe payment function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            paymentMethodId,
            paymentIntentId,
            ...paymentRequest
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process payment');
      }

      const data = await response.json();

      // If this payment is for an invoice, update the invoice status
      if (paymentRequest.invoice_id) {
        await invoiceService.updateInvoiceStatus(paymentRequest.invoice_id, 'paid');
      }

      return data.payment;
    } catch (error) {
      console.error('Error processing Stripe payment:', error);
      throw error;
    }
  }

  // Process a payment with Square
  async processSquarePayment(sourceId: string, paymentRequest: PaymentRequest): Promise<Payment> {
    try {
      // Get the session for authentication
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Authentication session expired');
      }

      // Call the Square payment function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/square-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            sourceId,
            ...paymentRequest
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process payment');
      }

      const data = await response.json();

      // If this payment is for an invoice, update the invoice status
      if (paymentRequest.invoice_id) {
        await invoiceService.updateInvoiceStatus(paymentRequest.invoice_id, 'paid');
      }

      return data.payment;
    } catch (error) {
      console.error('Error processing Square payment:', error);
      throw error;
    }
  }

  // Legacy method for backward compatibility
  async processPayment(paymentIntentId: string): Promise<Payment> {
    try {
      // Get the session for authentication
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Authentication session expired');
      }

      // Call the payment processing function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ paymentIntentId })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process payment');
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

  // Get payments for a project
  async getPaymentsForProject(projectId: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          invoice:invoice_id(*)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting payments for project:', error);
      return [];
    }
  }

  // Get payments for an invoice
  async getPaymentsForInvoice(invoiceId: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting payments for invoice:', error);
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

  // Update project payment status
  async updateProjectPaymentStatus(projectId: string, status: PaymentStatus): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ payment_status: status })
        .eq('id', projectId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating project payment status:', error);
      throw error;
    }
  }

  // Simulate a successful payment (for development/testing)
  async simulatePayment(
    amount: number,
    options: {
      bookingId?: string;
      projectId?: string;
      invoiceId?: string;
    }
  ): Promise<Payment> {
    try {
      const { bookingId, projectId, invoiceId } = options;

      if (!bookingId && !projectId && !invoiceId) {
        throw new Error('Either bookingId, projectId, or invoiceId must be provided');
      }

      // Create a payment record
      const { data, error } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          project_id: projectId,
          invoice_id: invoiceId,
          amount,
          currency: 'USD',
          status: 'paid',
          payment_method: 'credit_card',
          payment_processor: 'stripe',
          payment_intent_id: `sim_${Math.random().toString(36).substring(2, 15)}`,
          receipt_url: '#',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update related record status
      if (bookingId) {
        await this.updateBookingPaymentStatus(bookingId, 'paid');
      }

      if (projectId) {
        await this.updateProjectPaymentStatus(projectId, 'paid');
      }

      if (invoiceId) {
        await invoiceService.updateInvoiceStatus(invoiceId, 'paid');
      }

      return data;
    } catch (error) {
      console.error('Error simulating payment:', error);
      throw error;
    }
  }

  // Legacy method for backward compatibility
  async simulateBookingPayment(bookingId: string, amount: number): Promise<Payment> {
    return this.simulatePayment(amount, { bookingId });
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
        .select('*')
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

      // Update related record status
      if (payment.booking_id) {
        await this.updateBookingPaymentStatus(payment.booking_id, 'refunded');
      }

      if (payment.project_id) {
        await this.updateProjectPaymentStatus(payment.project_id, 'refunded');
      }

      if (payment.invoice_id) {
        // For invoices, we don't change the status to refunded, but we might want to create a credit note
        // or mark it in some way. For now, we'll leave it as is.
      }

      return data;
    } catch (error) {
      console.error('Error simulating refund:', error);
      throw error;
    }
  }

  // Process a refund with Stripe
  async processStripeRefund(paymentId: string, amount?: number): Promise<Payment> {
    try {
      // Get the session for authentication
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Authentication session expired');
      }

      // Call the Stripe refund function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-refund`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ paymentId, amount })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process refund');
      }

      const data = await response.json();
      return data.payment;
    } catch (error) {
      console.error('Error processing Stripe refund:', error);
      throw error;
    }
  }

  // Process a refund with Square
  async processSquareRefund(paymentId: string, amount?: number): Promise<Payment> {
    try {
      // Get the session for authentication
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Authentication session expired');
      }

      // Call the Square refund function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/square-refund`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ paymentId, amount })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process refund');
      }

      const data = await response.json();
      return data.payment;
    } catch (error) {
      console.error('Error processing Square refund:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
