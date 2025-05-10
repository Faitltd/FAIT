import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { paymentService } from '../../services/paymentService';
import { invoiceService } from '../../services/invoiceService';
import { Invoice } from '../../types/invoice';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
  Heading, 
  Text,
  Button
} from '../ui';
import { CreditCard, AlertCircle, FileText } from 'lucide-react';
import StripePaymentForm from './StripePaymentForm';
import SquarePaymentForm from './SquarePaymentForm';

interface InvoicePaymentFormProps {
  invoiceId: string;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
  className?: string;
}

const InvoicePaymentForm: React.FC<InvoicePaymentFormProps> = ({ 
  invoiceId,
  onSuccess,
  onCancel,
  className = '' 
}) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [selectedProcessor, setSelectedProcessor] = useState<'stripe' | 'square' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const fetchedInvoice = await invoiceService.getInvoiceById(invoiceId);
        setInvoice(fetchedInvoice);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch invoice');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoice();
  }, [invoiceId]);
  
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
  
  if (loading) {
    return (
      <div className={`flex justify-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`bg-red-50 border-l-4 border-red-400 p-4 ${className}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="mt-2"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!invoice) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <FileText className="h-12 w-12 mx-auto text-gray-400" />
        <Text variant="muted" className="mt-2">Invoice not found</Text>
        <Button
          variant="outline"
          onClick={onCancel}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <Heading level={3}>Pay Invoice {invoice.invoice_number}</Heading>
          <Text variant="muted">Due: {formatDate(invoice.due_date)}</Text>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Invoice Total:</span>
                <span className="text-sm font-medium">{formatCurrency(invoice.total_amount)}</span>
              </div>
              
              {invoice.payments && invoice.payments.length > 0 && (
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">Amount Paid:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(invoice.payments.reduce((sum, payment) => 
                      payment.status === 'paid' ? sum + payment.amount : sum, 0
                    ))}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between font-medium">
                <span className="text-sm text-gray-900">Amount Due:</span>
                <span className="text-sm text-gray-900">{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </div>
          
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
          
          {selectedProcessor ? (
            // Show the selected payment processor form
            <>
              {selectedProcessor === 'stripe' ? (
                <StripePaymentForm
                  amount={invoice.total_amount}
                  bookingId={invoice.project_id} // Using project_id in place of bookingId
                  onSuccess={handlePaymentSuccess}
                  onCancel={handleCancel}
                />
              ) : (
                <SquarePaymentForm
                  amount={invoice.total_amount}
                  bookingId={invoice.project_id} // Using project_id in place of bookingId
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

export default InvoicePaymentForm;
