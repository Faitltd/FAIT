import React, { useState } from 'react';
import { CreditCard, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import SquarePaymentForm from './SquarePaymentForm';
import StripePaymentForm from './StripePaymentForm';
import LoadingSpinner from '../LoadingSpinner';

interface PaymentInterfaceProps {
  amount: number;
  bookingId: string;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

type PaymentProcessor = 'stripe' | 'square';

const PaymentInterface: React.FC<PaymentInterfaceProps> = ({
  amount,
  bookingId,
  onSuccess,
  onCancel
}) => {
  const [selectedProcessor, setSelectedProcessor] = useState<PaymentProcessor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleProcessorSelect = (processor: PaymentProcessor) => {
    setSelectedProcessor(processor);
    setError(null);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    onSuccess(paymentId);
  };

  const handleCancel = () => {
    if (selectedProcessor) {
      setSelectedProcessor(null);
    } else {
      onCancel();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment</h2>
      
      <div className="mb-6 bg-gray-50 p-4 rounded-md">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Total Amount:</span>
          <span className="text-xl font-semibold text-gray-900">{formatCurrency(amount)}</span>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : selectedProcessor ? (
        // Show the selected payment processor form
        <>
          {selectedProcessor === 'stripe' ? (
            <StripePaymentForm
              amount={amount}
              bookingId={bookingId}
              onSuccess={handlePaymentSuccess}
              onCancel={handleCancel}
            />
          ) : (
            <SquarePaymentForm
              amount={amount}
              bookingId={bookingId}
              onSuccess={handlePaymentSuccess}
              onCancel={handleCancel}
            />
          )}
        </>
      ) : (
        // Show payment processor selection
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Select Payment Method</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleProcessorSelect('stripe')}
              className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center"
            >
              <div className="w-12 h-12 flex items-center justify-center mr-4">
                <img src="/stripe-logo.svg" alt="Stripe" className="h-8" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Pay with Stripe</h4>
                <p className="text-sm text-gray-500">Credit/Debit Card, Apple Pay, Google Pay</p>
              </div>
            </button>
            
            <button
              onClick={() => handleProcessorSelect('square')}
              className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center"
            >
              <div className="w-12 h-12 flex items-center justify-center mr-4">
                <img src="/square-logo.svg" alt="Square" className="h-8" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Pay with Square</h4>
                <p className="text-sm text-gray-500">Credit/Debit Card, Apple Pay, Google Pay</p>
              </div>
            </button>
          </div>
          
          <div className="flex justify-between pt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentInterface;
