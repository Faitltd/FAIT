import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const PaymentForm = ({ clientSecret, bookingId, amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (paymentMethod === 'card') {
      if (!stripe || !elements) {
        setProcessing(false);
        return;
      }

      const cardElement = elements.getElement(CardElement);

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            // You can collect billing details here if needed
          },
        },
      });

      if (error) {
        setError(`Payment failed: ${error.message}`);
        setProcessing(false);
      } else if (paymentIntent.status === 'succeeded') {
        handlePaymentSuccess();
      }
    } else if (paymentMethod === 'paypal') {
      // In a real implementation, you would integrate with PayPal SDK
      // For this example, we'll simulate a successful PayPal payment
      setTimeout(() => {
        handlePayPalSuccess();
      }, 1500);
    }
  };

  const handlePaymentSuccess = async () => {
    setError(null);
    setSucceeded(true);
    
    // Update local booking status for immediate UI feedback
    try {
      // In a real app, this would be handled by a webhook
      // This is just for demonstration purposes
      await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', bookingId);
      
      // Notify parent component
      onSuccess();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handlePayPalSuccess = async () => {
    setError(null);
    setSucceeded(true);
    
    try {
      // Simulate PayPal payment processing
      const response = await fetch('/api/process-paypal-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          paypalOrderId: 'SIMULATED_ORDER_' + Math.random().toString(36).substring(2, 15),
          paypalPayerId: 'SIMULATED_PAYER_' + Math.random().toString(36).substring(2, 15)
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Notify parent component
        onSuccess();
      } else {
        throw new Error('Failed to process PayPal payment');
      }
    } catch (error) {
      console.error('Error processing PayPal payment:', error);
      setError('Failed to process PayPal payment. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
        
        <div className="flex space-x-4 mb-6">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`flex-1 py-2 px-4 rounded-md ${
              paymentMethod === 'card'
                ? 'bg-blue-100 border-blue-500 border-2 text-blue-700'
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center">
              <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Credit Card
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setPaymentMethod('paypal')}
            className={`flex-1 py-2 px-4 rounded-md ${
              paymentMethod === 'paypal'
                ? 'bg-blue-100 border-blue-500 border-2 text-blue-700'
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center">
              <svg className="h-6 w-6 mr-2 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.384a.64.64 0 0 1 .632-.537h6.012c2.658 0 4.53.625 5.255 1.757.62.968.6 2.216-.06 3.462-.013.025-.027.05-.04.076-.84 1.517-2.5 2.714-4.93 2.714h-1.847c-.625 0-1.155.455-1.25 1.07l-.918 5.918-.342 2.168a.639.639 0 0 1-.632.537zm-3.7-1.177h3.045l.743-4.708.346-2.195.288-1.834a1.81 1.81 0 0 1 1.79-1.534h1.847c1.87 0 3.094-.816 3.658-1.823.522-.932.464-1.8.1-2.33-.42-.61-1.472-1.1-3.471-1.1H6.02L3.376 20.16z" />
                <path d="M18.032 21.337h-4.606a.642.642 0 0 1-.632-.74l.744-4.708.346-2.196.288-1.833a1.81 1.81 0 0 1 1.79-1.534h1.847c1.87 0 3.094-.816 3.658-1.823.522-.932.464-1.8.1-2.33-.42-.61-1.472-1.1-3.471-1.1h-4.606a.642.642 0 0 1-.632-.74L15.97 3.12a.64.64 0 0 1 .632-.537h6.012c2.658 0 4.53.625 5.255 1.757.62.968.6 2.216-.06 3.462-.013.025-.027.05-.04.076-.84 1.517-2.5 2.714-4.93 2.714h-1.847c-.625 0-1.155.455-1.25 1.07l-.918 5.918-.342 2.168a.639.639 0 0 1-.632.537zm-3.7-1.177h3.045l.743-4.708.346-2.195.288-1.834a1.81 1.81 0 0 1 1.79-1.534h1.847c1.87 0 3.094-.816 3.658-1.823.522-.932.464-1.8.1-2.33-.42-.61-1.472-1.1-3.471-1.1h-4.606L14.332 20.16z" />
              </svg>
              PayPal
            </div>
          </button>
        </div>
        
        {paymentMethod === 'card' && (
          <div className="border border-gray-300 p-4 rounded-md bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        )}
        
        {paymentMethod === 'paypal' && (
          <div className="border border-gray-300 p-4 rounded-md bg-white text-center">
            <p className="text-sm text-gray-500 mb-2">
              You'll be redirected to PayPal to complete your payment.
            </p>
            <div className="bg-blue-500 text-white py-2 px-4 rounded-md inline-block">
              <span className="font-bold">Pay</span><span className="font-light">Pal</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Summary</h3>
        <div className="flex justify-between mb-2">
          <span className="text-gray-500">Service Fee:</span>
          <span className="text-gray-900">${amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-500">Platform Fee:</span>
          <span className="text-gray-900">${(amount * 0.05).toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-medium">
          <span>Total:</span>
          <span>${(amount * 1.05).toFixed(2)}</span>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={processing || succeeded || (paymentMethod === 'card' && !stripe)}
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            (processing || (paymentMethod === 'card' && !stripe)) ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {processing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : succeeded ? (
            'Payment Successful'
          ) : (
            `Pay $${(amount * 1.05).toFixed(2)}`
          )}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
