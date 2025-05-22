import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  DollarSign, 
  AlertCircle, 
  Lock, 
  Calendar as CalendarIcon, 
  CreditCard as CreditCardIcon 
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface PaymentStepProps {
  bookingData: any;
  updateBookingData: (step: string, data: any) => void;
  service: any;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ 
  bookingData, 
  updateBookingData, 
  service 
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'paypal' | 'apple_pay' | 'google_pay'>(
    bookingData.payment.method || 'credit_card'
  );
  const [cardNumber, setCardNumber] = useState(bookingData.payment.card_number || '');
  const [cardExpiry, setCardExpiry] = useState(bookingData.payment.expiry || '');
  const [cardCvv, setCardCvv] = useState(bookingData.payment.cvv || '');
  const [savePayment, setSavePayment] = useState(bookingData.payment.save_payment || false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Calculate total price
  const serviceFee = service ? service.price * 0.05 : 0;
  const totalPrice = service ? service.price + serviceFee : 0;
  
  // Update booking data when form changes
  useEffect(() => {
    updateBookingData('payment', {
      method: paymentMethod,
      card_number: cardNumber,
      expiry: cardExpiry,
      cvv: cardCvv,
      save_payment: savePayment
    });
  }, [paymentMethod, cardNumber, cardExpiry, cardCvv, savePayment, updateBookingData]);
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (paymentMethod === 'credit_card') {
      if (!cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Please enter a valid 16-digit card number';
      }
      
      if (!cardExpiry.trim()) {
        newErrors.cardExpiry = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        newErrors.cardExpiry = 'Please enter a valid expiry date (MM/YY)';
      }
      
      if (!cardCvv.trim()) {
        newErrors.cardCvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(cardCvv)) {
        newErrors.cardCvv = 'Please enter a valid CVV';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Form is valid, proceed to next step
    }
  };
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Handle card number input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
  };
  
  // Handle expiry date input
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    
    setCardExpiry(value);
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h2>
      
      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-md p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Service Price</span>
          <span className="font-medium">{formatCurrency(service?.price || 0)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Service Fee</span>
          <span className="font-medium">{formatCurrency(serviceFee)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
        </div>
      </div>
      
      {/* Payment Methods */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Method
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <motion.button
            type="button"
            onClick={() => setPaymentMethod('credit_card')}
            className={`p-4 rounded-md border ${
              paymentMethod === 'credit_card'
                ? 'border-company-lightpink bg-pink-50'
                : 'border-gray-200 hover:border-gray-300'
            } flex flex-col items-center justify-center`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <CreditCardIcon className={`h-6 w-6 mb-1 ${
              paymentMethod === 'credit_card' ? 'text-company-lightpink' : 'text-gray-400'
            }`} />
            <span className={`text-sm font-medium ${
              paymentMethod === 'credit_card' ? 'text-company-lightpink' : 'text-gray-700'
            }`}>Credit Card</span>
          </motion.button>
          
          <motion.button
            type="button"
            onClick={() => setPaymentMethod('paypal')}
            className={`p-4 rounded-md border ${
              paymentMethod === 'paypal'
                ? 'border-company-lightpink bg-pink-50'
                : 'border-gray-200 hover:border-gray-300'
            } flex flex-col items-center justify-center`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className={`h-6 w-6 mb-1 ${
              paymentMethod === 'paypal' ? 'text-company-lightpink' : 'text-gray-400'
            }`} viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.641.641 0 0 1 .632-.546h6.964c2.075 0 3.747.517 4.966 1.538 1.102.927 1.653 2.169 1.653 3.692 0 .732-.123 1.464-.37 2.196-.247.732-.617 1.44-1.112 2.124-.494.684-1.09 1.27-1.778 1.757-.688.488-1.482.877-2.38 1.169-.9.292-1.853.438-2.87.438h-.494c-.765 0-1.4.254-1.9.763-.5.51-.802 1.15-.9 1.927l-.07.41-.236 1.517-.014.085c-.022.13-.04.217-.054.26a.636.636 0 0 1-.633.546h-.002v.001zm9.984-14.4c0-.975-.352-1.747-1.053-2.316-.702-.57-1.683-.854-2.939-.854h-5.19l-1.564 9.91h4.47c1.112 0 2.044-.13 2.796-.387.752-.258 1.364-.61 1.84-1.053a5.29 5.29 0 0 0 1.111-1.538 7.6 7.6 0 0 0 .617-1.733c.123-.57.185-1.12.185-1.649 0-.138-.003-.276-.01-.413a2.317 2.317 0 0 0-.037-.325c-.018-.102-.043-.204-.074-.306a2.22 2.22 0 0 0-.123-.336h.002-.031z" />
            </svg>
            <span className={`text-sm font-medium ${
              paymentMethod === 'paypal' ? 'text-company-lightpink' : 'text-gray-700'
            }`}>PayPal</span>
          </motion.button>
          
          <motion.button
            type="button"
            onClick={() => setPaymentMethod('apple_pay')}
            className={`p-4 rounded-md border ${
              paymentMethod === 'apple_pay'
                ? 'border-company-lightpink bg-pink-50'
                : 'border-gray-200 hover:border-gray-300'
            } flex flex-col items-center justify-center`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className={`h-6 w-6 mb-1 ${
              paymentMethod === 'apple_pay' ? 'text-company-lightpink' : 'text-gray-400'
            }`} viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.72 7.22a3.74 3.74 0 0 0-3.07 1.86 3.58 3.58 0 0 0 .89 4.79A3.65 3.65 0 0 0 17.72 7.22zM17 0a4.24 4.24 0 0 0-3 1.35 4.14 4.14 0 0 0-1 3.07 3.79 3.79 0 0 0 3.07-1.35A4.14 4.14 0 0 0 17 0zM24 16.43c0 .93-.35 1.77-1 2.48a3.94 3.94 0 0 1-2.64 1.35c-1.51 0-2.23-.93-4.13-.93s-2.64.93-4.13.93A3.91 3.91 0 0 1 9.5 18.91a8.32 8.32 0 0 1-3.35-6.68 5.32 5.32 0 0 1 2.4-4.58 4.69 4.69 0 0 1 2.64-.76c1.51 0 2.23.93 4.13.93s2.64-.93 4.13-.93a4.69 4.69 0 0 1 2.64.76 5.32 5.32 0 0 1 2.4 4.58 8.32 8.32 0 0 1-1.35 3.35A3.27 3.27 0 0 0 24 16.43z" />
            </svg>
            <span className={`text-sm font-medium ${
              paymentMethod === 'apple_pay' ? 'text-company-lightpink' : 'text-gray-700'
            }`}>Apple Pay</span>
          </motion.button>
          
          <motion.button
            type="button"
            onClick={() => setPaymentMethod('google_pay')}
            className={`p-4 rounded-md border ${
              paymentMethod === 'google_pay'
                ? 'border-company-lightpink bg-pink-50'
                : 'border-gray-200 hover:border-gray-300'
            } flex flex-col items-center justify-center`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className={`h-6 w-6 mb-1 ${
              paymentMethod === 'google_pay' ? 'text-company-lightpink' : 'text-gray-400'
            }`} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 24C5.372 24 0 18.628 0 12S5.372 0 12 0s12 5.372 12 12-5.372 12-12 12zm0-1.5c5.799 0 10.5-4.701 10.5-10.5S17.799 1.5 12 1.5 1.5 6.201 1.5 12 6.201 22.5 12 22.5zM7.05 14.25h4.5a.75.75 0 0 0 0-1.5h-3a1.5 1.5 0 0 1 0-3h3.75a.75.75 0 0 0 0-1.5h-3.75a3 3 0 0 0 0 6h3a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 0 0 1.5h4.5a2.25 2.25 0 0 0 0-4.5h-3a.75.75 0 0 1 0-1.5h3.75a2.25 2.25 0 0 0 0-4.5h-3.75a3 3 0 0 0 0 6h3a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 0 0 1.5z" />
            </svg>
            <span className={`text-sm font-medium ${
              paymentMethod === 'google_pay' ? 'text-company-lightpink' : 'text-gray-700'
            }`}>Google Pay</span>
          </motion.button>
        </div>
      </div>
      
      {/* Credit Card Form */}
      {paymentMethod === 'credit_card' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Number */}
          <div>
            <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="card-number"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                placeholder="1234 5678 9012 3456"
                className={`block w-full pl-10 pr-3 py-3 border ${
                  errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-company-lightpink focus:border-company-lightpink`}
              />
              {errors.cardNumber && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
            )}
          </div>
          
          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            {/* Expiry */}
            <div>
              <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="expiry"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  maxLength={5}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.cardExpiry ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-company-lightpink focus:border-company-lightpink`}
                />
                {errors.cardExpiry && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.cardExpiry && (
                <p className="mt-1 text-sm text-red-600">{errors.cardExpiry}</p>
              )}
            </div>
            
            {/* CVV */}
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="cvv"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                  placeholder="123"
                  maxLength={4}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.cardCvv ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-company-lightpink focus:border-company-lightpink`}
                />
                {errors.cardCvv && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.cardCvv && (
                <p className="mt-1 text-sm text-red-600">{errors.cardCvv}</p>
              )}
            </div>
          </div>
          
          {/* Save Payment Method */}
          <div className="flex items-center">
            <input
              id="save-payment"
              type="checkbox"
              checked={savePayment}
              onChange={(e) => setSavePayment(e.target.checked)}
              className="h-4 w-4 text-company-lightpink focus:ring-company-lightpink border-gray-300 rounded"
            />
            <label htmlFor="save-payment" className="ml-2 block text-sm text-gray-700">
              Save this payment method for future bookings
            </label>
          </div>
        </form>
      )}
      
      {/* Other Payment Methods */}
      {paymentMethod !== 'credit_card' && (
        <div className="bg-gray-50 rounded-md p-6 text-center">
          <p className="text-gray-600 mb-4">
            {paymentMethod === 'paypal' && 'You will be redirected to PayPal to complete your payment.'}
            {paymentMethod === 'apple_pay' && 'You will be prompted to confirm payment with Apple Pay.'}
            {paymentMethod === 'google_pay' && 'You will be prompted to confirm payment with Google Pay.'}
          </p>
          <div className="flex justify-center">
            <DollarSign className="h-12 w-12 text-gray-400" />
          </div>
        </div>
      )}
      
      {/* Secure Payment Notice */}
      <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
        <Lock className="h-4 w-4 mr-1" />
        <span>All payments are secure and encrypted</span>
      </div>
    </div>
  );
};

export default PaymentStep;
