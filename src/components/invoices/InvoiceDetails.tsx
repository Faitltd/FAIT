import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceStatus } from '../../types/invoice';
import { invoiceService } from '../../services/invoiceService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
  Heading, 
  Text,
  Button,
  Badge
} from '../ui';
import { 
  FileText, 
  Download, 
  Send, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle
} from 'lucide-react';

interface InvoiceDetailsProps {
  invoiceId: string;
  onPayInvoice?: () => void;
  onBack?: () => void;
  className?: string;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ 
  invoiceId,
  onPayInvoice,
  onBack,
  className = '' 
}) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
  
  // Handle sending an invoice
  const handleSendInvoice = async () => {
    if (!invoice) return;
    
    try {
      await invoiceService.sendInvoice(invoice.id);
      
      // Update the invoice status in the local state
      setInvoice(prevInvoice => 
        prevInvoice ? { ...prevInvoice, status: 'sent' as InvoiceStatus } : null
      );
    } catch (err) {
      console.error('Error sending invoice:', err);
      alert(err instanceof Error ? err.message : 'Failed to send invoice');
    }
  };
  
  // Handle downloading an invoice PDF
  const handleDownloadInvoice = async () => {
    if (!invoice) return;
    
    try {
      const pdfUrl = await invoiceService.generateInvoicePDF(invoice.id);
      window.open(pdfUrl, '_blank');
    } catch (err) {
      console.error('Error downloading invoice:', err);
      alert(err instanceof Error ? err.message : 'Failed to download invoice');
    }
  };
  
  // Get status badge color and icon
  const getStatusBadge = (status: InvoiceStatus) => {
    let color = '';
    let icon = null;
    
    switch (status) {
      case 'draft':
        color = 'bg-gray-100 text-gray-800';
        icon = <Clock className="h-4 w-4 mr-1" />;
        break;
      case 'sent':
        color = 'bg-blue-100 text-blue-800';
        icon = <Send className="h-4 w-4 mr-1" />;
        break;
      case 'paid':
        color = 'bg-green-100 text-green-800';
        icon = <CheckCircle className="h-4 w-4 mr-1" />;
        break;
      case 'overdue':
        color = 'bg-red-100 text-red-800';
        icon = <AlertTriangle className="h-4 w-4 mr-1" />;
        break;
      case 'cancelled':
        color = 'bg-yellow-100 text-yellow-800';
        icon = <XCircle className="h-4 w-4 mr-1" />;
        break;
      default:
        color = 'bg-gray-100 text-gray-800';
        icon = <Clock className="h-4 w-4 mr-1" />;
    }
    
    return (
      <span className={`px-3 py-1 inline-flex items-center text-sm font-medium rounded-full ${color}`}>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            {onBack && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="mt-2"
              >
                Go Back
              </Button>
            )}
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
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            className="mt-4"
          >
            Go Back
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <Heading level={3}>Invoice {invoice.invoice_number}</Heading>
              <Text variant="muted" className="mt-1">
                {invoice.project?.name || 'No Project'}
              </Text>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              {getStatusBadge(invoice.status)}
              
              <div className="flex space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadInvoice}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                
                {invoice.status === 'draft' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendInvoice}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Invoice
                  </Button>
                )}
                
                {(invoice.status === 'sent' || invoice.status === 'overdue') && onPayInvoice && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onPayInvoice}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Invoice
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">From</h4>
                <div className="text-sm">
                  <p className="font-medium">{invoice.service_agent?.name || 'Service Agent'}</p>
                  <p>{invoice.service_agent?.email || 'No email'}</p>
                  <p>{invoice.service_agent?.phone || 'No phone'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">To</h4>
                <div className="text-sm">
                  <p className="font-medium">{invoice.client?.name || 'Client'}</p>
                  <p>{invoice.client?.email || 'No email'}</p>
                  <p>{invoice.client?.phone || 'No phone'}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Invoice Number</h4>
                <p className="text-sm">{invoice.invoice_number}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Issue Date</h4>
                <p className="text-sm">{formatDate(invoice.issue_date)}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Due Date</h4>
                <p className="text-sm">{formatDate(invoice.due_date)}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Line Items</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoice.line_items && invoice.line_items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {item.tax_rate ? `${item.tax_rate}%` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {item.discount_amount ? formatCurrency(item.discount_amount) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={5} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                        Subtotal:
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                        Tax:
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.tax_amount || 0)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                        Discount:
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.discount_amount || 0)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                        Total:
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                        {formatCurrency(invoice.total_amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            {invoice.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Notes</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{invoice.notes}</p>
                </div>
              </div>
            )}
            
            {invoice.terms && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Terms</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{invoice.terms}</p>
                </div>
              </div>
            )}
            
            {invoice.payments && invoice.payments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Payments</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoice.payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(payment.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.payment_method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                              payment.status === 'refunded' ? 'bg-gray-100 text-gray-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatCurrency(payment.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter>
          <div className="flex justify-between">
            {onBack && (
              <Button
                variant="outline"
                onClick={onBack}
              >
                Back to Invoices
              </Button>
            )}
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleDownloadInvoice}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              
              {invoice.status === 'draft' && (
                <Button
                  variant="outline"
                  onClick={handleSendInvoice}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Invoice
                </Button>
              )}
              
              {(invoice.status === 'sent' || invoice.status === 'overdue') && onPayInvoice && (
                <Button
                  variant="primary"
                  onClick={onPayInvoice}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Invoice
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InvoiceDetails;
