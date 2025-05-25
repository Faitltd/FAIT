import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { paymentService } from '../../services/paymentService';
import { formatCurrency } from '../../utils/formatters';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
  Heading, 
  Text,
  Button
} from '../ui';
import { CreditCard, AlertCircle } from 'lucide-react';
import StripePaymentForm from './StripePaymentForm';
import SquarePaymentForm from './SquarePaymentForm';

interface ProjectPaymentFormProps {
  projectId: string;
  invoiceId?: string;
  amount: number;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
  className?: string;
}

const ProjectPaymentForm: React.FC<ProjectPaymentFormProps> = ({ 
  projectId,
  invoiceId,
  amount,
  onSuccess,
  onCancel,
  className = '' 
}) => {
  const [selectedProcessor, setSelectedProcessor] = useState<'stripe' | 'square' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  
  const handleProcessorSelect = (processor: 'stripe' | 'square') => {
    setSelectedProcessor(processor);
    setError(null);
  };
  
  const handlePaymentSuccess = (paymentId: string) => {
    onSuccess(paymentId);
  };
  
  const handleCancel = () => {
    setSelectedProcessor(null);
    setError(null);
    onCancel();
  };
  
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <Heading level={3}>Payment</Heading>
          <Text variant="muted">Amount: {formatCurrency(amount)}</Text>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : selectedProcessor ? (
            // Show the selected payment processor form
            <>
              {selectedProcessor === 'stripe' ? (
                <StripePaymentForm
                  amount={amount}
                  bookingId={projectId} // Using projectId in place of bookingId
                  onSuccess={handlePaymentSuccess}
                  onCancel={handleCancel}
                />
              ) : (
                <SquarePaymentForm
                  amount={amount}
                  bookingId={projectId} // Using projectId in place of bookingId
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
                <div 
                  className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleProcessorSelect('stripe')}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img src="/images/stripe-logo.svg" alt="Stripe" className="h-8 w-auto" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">Pay with Stripe</h4>
                      <p className="text-sm text-gray-500">Credit or debit card</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleProcessorSelect('square')}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img src="/images/square-logo.svg" alt="Square" className="h-8 w-auto" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900">Pay with Square</h4>
                      <p className="text-sm text-gray-500">Credit or debit card</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  Your payment information is secure. We use industry-standard encryption to protect your data.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        
        {!selectedProcessor && (
          <CardFooter>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ProjectPaymentForm;
