import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type PaymentFormProps = {
  bookingId: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
};

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  bookingId, 
  amount, 
  onSuccess, 
  onError 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [zip, setZip] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      onError('You must be logged in to make a payment');
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real implementation, you would use Stripe.js or similar
      // to securely collect and tokenize card details
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }
      
      // Call your payment processing endpoint
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-payment`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId,
            paymentMethodId: 'pm_card_visa', // This would be a real payment method ID in production
          }),
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment failed');
      }
      