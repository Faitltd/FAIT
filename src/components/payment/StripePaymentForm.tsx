import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';

// Define Stripe types
declare global {
  interface Window {
    Stripe?: (apiKey: string) => {
      elements: (options?: any) => any;
      createPaymentMethod: (options: any) => Promise<any>;
    };
  }
}

interface StripePaymentFormProps {
  amount: number;
  bookingId: string;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  bookingId,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [cardElement, setCardElement] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load Stripe.js
  useEffect(() => {
    const loadStripe = async () => {
      if (window.Stripe) {
        initializeStripe();
      } else {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;
        script.onload = () => initializeStripe();
        script.onerror = () => {
          setError('Failed to load Stripe payment SDK');
          setInitializing(false);
        };
        document.body.appendChild(script);
      }
    };

    loadStripe();
  }, []);

  const initializeStripe = () => {
    try {
      if (!window.Stripe) {
        throw new Error('Stripe.js not loaded');
      }

      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      
      if (!stripeKey) {
        throw new Error('Stripe configuration is missing');
      }

      const stripeInstance = window.Stripe(stripeKey);
      setStripe(stripeInstance);

      const elementsInstance = stripeInstance.elements();
      setElements(elementsInstance);

      const card = elementsInstance.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#32325d',
            fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
            '::placeholder': {
              color: '#aab7c4'
            }
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
          }
        }
      });

      card.mount('#card-element');
      setCardElement(card);

      // Listen for errors
      card.on('change', (event: any) => {
        setError(event.error ? event.error.message : null);
      });

      setInitializing(false);
    } catch (err) {
      console.error('Error initializing Stripe:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize payment form');
      setInitializing(false);
    }
  };

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!user) {
      setError('You must be logged in to make a payment');
      return;
    }
    
    if (!stripe || !elements || !cardElement) {
      setError('Payment form not initialized');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement
      });
      
      if (stripeError) {
        throw new Error(stripeError.message);
      }
      
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
            paymentMethodId: paymentMethod.id,
            amount,
            bookingId,
            currency: 'usd'
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment failed');
      }
      
      const { data: paymentData } = await response.json();
      
      // Update booking with payment information
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          payment_status: 'completed',
          payment_intent_id: paymentData.id,
          payment_method: 'stripe',
          paid_at: new Date().toISOString(),
          status: 'confirmed'
        })
        .eq('id', bookingId);
      
      if (bookingError) {
        throw bookingError;
      }
      
      // Create notification for the service agent
      await supabase
        .from('notifications')
        .insert({
          user_id: paymentData.service_agent_id,
          title: 'Payment Received',
          message: `Payment of ${formatCurrency(amount)} has been received for booking #${bookingId.substring(0, 8)}`,
          type: 'payment',
          is_read: false
        });
      
      setSuccess(true);
      
      // Call the success callback after a short delay to show the success message
      setTimeout(() => {
        onSuccess(paymentData.id);
      }, 2000);
      
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your payment of {formatCurrency(amount)} has been processed successfully.
        </p>
        <button
          onClick={() => onSuccess('payment-completed')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View Booking Details
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center mb-4">
          <img src="/stripe-logo.svg" alt="Stripe" className="h-6 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Pay with Stripe</h3>
        </div>
        
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        
        {initializing ? (
          <div className="border border-gray-300 rounded-md p-4 flex items-center justify-center h-12">
            <LoadingSpinner size="small" />
            <span className="ml-2 text-gray-500">Initializing payment form...</span>
          </div>
        ) : (
          <div
            id="card-element"
            className="border border-gray-300 rounded-md p-4 min-h-[40px]"
          ></div>
        )}
        
        <p className="mt-2 text-xs text-gray-500">
          Your card information is securely processed by Stripe. We do not store your card details.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handlePayment}
          disabled={loading || initializing || !cardElement}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
        >
          {loading ? (
            <>
              <LoadingSpinner size="small" />
              <span className="ml-2">Processing...</span>
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay {formatCurrency(amount)}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StripePaymentForm;
