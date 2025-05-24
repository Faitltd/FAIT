import React, { useState, useEffect } from 'react';
import { Payment, PaymentStatus } from '../../services/paymentService';
import { paymentService } from '../../services/paymentService';
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
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Receipt, 
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface PaymentHistoryProps {
  projectId?: string;
  bookingId?: string;
  invoiceId?: string;
  onViewPayment?: (paymentId: string) => void;
  onRequestRefund?: (paymentId: string) => void;
  className?: string;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ 
  projectId,
  bookingId,
  invoiceId,
  onViewPayment,
  onRequestRefund,
  className = '' 
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [sortField, setSortField] = useState<'created_at' | 'amount'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let fetchedPayments: Payment[] = [];
        
        if (projectId) {
          fetchedPayments = await paymentService.getPaymentsForProject(projectId);
        } else if (bookingId) {
          fetchedPayments = await paymentService.getPaymentsForBooking(bookingId);
        } else if (invoiceId) {
          fetchedPayments = await paymentService.getPaymentsForInvoice(invoiceId);
        } else {
          throw new Error('Either projectId, bookingId, or invoiceId must be provided');
        }
        
        setPayments(fetchedPayments);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch payments');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayments();
  }, [projectId, bookingId, invoiceId]);
  
  // Filter payments by status and search term
  const filteredPayments = payments.filter(payment => {
    // Filter by status
    if (statusFilter !== 'all' && payment.status !== statusFilter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        payment.payment_method.toLowerCase().includes(searchLower) ||
        payment.payment_processor.toLowerCase().includes(searchLower) ||
        (payment.invoice?.invoice_number && payment.invoice.invoice_number.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });
  
  // Sort payments
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'created_at') {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortField === 'amount') {
      comparison = a.amount - b.amount;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // Toggle sort direction
  const toggleSort = (field: 'created_at' | 'amount') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Get status badge color and icon
  const getStatusBadge = (status: PaymentStatus) => {
    let color = '';
    let icon = null;
    
    switch (status) {
      case 'paid':
        color = 'bg-green-100 text-green-800';
        icon = <CheckCircle className="h-4 w-4 mr-1" />;
        break;
      case 'pending':
        color = 'bg-yellow-100 text-yellow-800';
        icon = <Clock className="h-4 w-4 mr-1" />;
        break;
      case 'processing':
        color = 'bg-blue-100 text-blue-800';
        icon = <RefreshCw className="h-4 w-4 mr-1" />;
        break;
      case 'failed':
        color = 'bg-red-100 text-red-800';
        icon = <XCircle className="h-4 w-4 mr-1" />;
        break;
      case 'refunded':
        color = 'bg-gray-100 text-gray-800';
        icon = <RefreshCw className="h-4 w-4 mr-1" />;
        break;
      default:
        color = 'bg-gray-100 text-gray-800';
        icon = <AlertTriangle className="h-4 w-4 mr-1" />;
    }
    
    return (
      <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${color}`}>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <Heading level={3}>Payment History</Heading>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'all')}
                  className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 w-full"
                />
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            ) : sortedPayments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-gray-400" />
                <Text variant="muted" className="mt-2">No payment history found</Text>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort('created_at')}
                      >
                        <div className="flex items-center">
                          Date
                          {sortField === 'created_at' && (
                            sortDirection === 'asc' ? 
                              <ChevronUp className="h-4 w-4 ml-1" /> : 
                              <ChevronDown className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort('amount')}
                      >
                        <div className="flex items-center justify-end">
                          Amount
                          {sortField === 'amount' && (
                            sortDirection === 'asc' ? 
                              <ChevronUp className="h-4 w-4 ml-1" /> : 
                              <ChevronDown className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(payment.created_at)}</div>
                          <div className="text-xs text-gray-500">
                            {payment.invoice?.invoice_number && `Invoice: ${payment.invoice.invoice_number}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {payment.payment_method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payment.payment_processor.charAt(0).toUpperCase() + payment.payment_processor.slice(1)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {onViewPayment && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewPayment(payment.id)}
                                title="View Receipt"
                              >
                                <Receipt className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {payment.status === 'paid' && onRequestRefund && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRequestRefund(payment.id)}
                                title="Request Refund"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistory;
