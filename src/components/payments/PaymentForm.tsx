import React, { useState } from 'react';
import { paymentService } from '../../services/PaymentService';
import { formatCurrency } from '../../utils/formatters';
import { CreditCard, DollarSign, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

interface PaymentFormProps {
  bookingId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  bookingId,
  amount,
  onSuccess,
  onCancel
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'square'>('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulateMode, setSimulateMode] = useState(process.env.NODE_ENV === 'development');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!simulateMode) {
      // Validate form
      if (!cardNumber.trim()) {
        setError('Please enter a card number');
        return;
      }

      if (!cardExpiry.trim()) {
        setError('Please enter an expiry date');
        return;
      }

      if (!cardCvc.trim()) {
        setError('Please enter a CVC');
        return;
      }

      if (!cardName.trim()) {
        setError('Please enter the cardholder name');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      if (simulateMode) {
        // Simulate payment in development mode
        await paymentService.simulatePayment(bookingId, amount);
      } else {
        // Create payment intent
        const { clientSecret, paymentIntentId } = await paymentService.createPaymentIntent({
          booking_id: bookingId,
          amount,
          currency: 'USD',
          payment_method: paymentMethod
        });

        // Process payment
        await paymentService.processPayment(paymentIntentId);
      }

      onSuccess();
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Add space after every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');

    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.substring(0, 19);
  };

  const formatExpiry = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format as MM/YY
    if (digits.length > 2) {
      return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
    }

    return digits;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardExpiry(formatExpiry(e.target.value));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">Payment</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="bg-gray-50 rounded-md p-4 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Total Amount</h3>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(amount)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        {simulateMode ? (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Development Mode</h3>
            <p className="text-sm text-yellow-700">
              Payment processing is simulated in development mode. Click "Pay Now" to simulate a successful payment.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`border rounded-md p-4 flex items-center cursor-pointer ${
                    paymentMethod === 'credit_card'
                      ? 'border-company-lightpink bg-company-lightblue'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setPaymentMethod('credit_card')}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    checked={paymentMethod === 'credit_card'}
                    onChange={() => setPaymentMethod('credit_card')}
                    className="h-4 w-4 text-company-lightpink focus:ring-company-lightpink border-gray-300"
                  />
                  <div className="ml-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">Credit Card</span>
                </div>

                <div
                  className={`border rounded-md p-4 flex items-center cursor-pointer ${
                    paymentMethod === 'square'
                      ? 'border-company-lightpink bg-company-lightblue'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setPaymentMethod('square')}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    checked={paymentMethod === 'square'}
                    onChange={() => setPaymentMethod('square')}
                    className="h-4 w-4 text-company-lightpink focus:ring-company-lightpink border-gray-300"
                  />
                  <div className="ml-3">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zm1 5a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H7z" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">Square</span>
                </div>
              </div>
            </div>

            {paymentMethod === 'credit_card' && (
              <>
                <div className="mb-4">
                  <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="card-number"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-company-lightpink focus:border-company-lightpink sm:text-sm"
                      maxLength={19}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="card-expiry" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      id="card-expiry"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      maxLength={5}
                    />
                  </div>

                  <div>
                    <label htmlFor="card-cvc" className="block text-sm font-medium text-gray-700 mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      id="card-cvc"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                      placeholder="123"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="card-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    id="card-name"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </>
            )}

            {paymentMethod === 'square' && (
              <div className="mb-6 bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-700">
                  You will be redirected to Square to complete your payment.
                </p>
              </div>
            )}
          </>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-company-lightpink disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-company-lightpink hover:bg-company-lighterpink focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-company-lightblue disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                <span className="ml-2">Processing...</span>
              </>
            ) : (
              `Pay ${formatCurrency(amount)}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
