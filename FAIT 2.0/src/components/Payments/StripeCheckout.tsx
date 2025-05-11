import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createSetupIntent } from '../../lib/api/paymentsApi';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface CheckoutFormProps {
  onSuccess: (paymentMethodId: string) => void;
  onError: (error: string) => void;
  buttonText?: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onSuccess,
  onError,
  buttonText = 'Add Payment Method',
}) => {
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSetupIntent = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const secret = await createSetupIntent(user.id);
        setClientSecret(secret);
      } catch (err) {
        console.error('Error creating setup intent:', err);
        setError('Failed to initialize payment form. Please try again.');
        onError('Failed to initialize payment form');
      } finally {
        setLoading(false);
      }
    };

    getSetupIntent();
  }, [user, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: user?.email,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (setupIntent && setupIntent.payment_method) {
        onSuccess(setupIntent.payment_method as string);
      } else {
        throw new Error('Failed to set up payment method');
      }
    } catch (err) {
      console.error('Error confirming card setup:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="card-element" className="block text-sm font-medium text-gray-700 mb-2">
          Credit or debit card
        </label>
        <div className="p-3 border border-gray-300 rounded-md">
          <CardElement
            id="card-element"
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
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        className={`w-full py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          !stripe || !elements || loading
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500'
        }`}
      >
        {loading ? 'Processing...' : buttonText}
      </button>
    </form>
  );
};

interface StripeCheckoutProps {
  onSuccess: (paymentMethodId: string) => void;
  onError: (error: string) => void;
  buttonText?: string;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default StripeCheckout;
