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
  Eye, 
  CreditCard, 
  Filter, 
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface InvoiceListProps {
  projectId?: string;
  clientId?: string;
  serviceAgentId?: string;
  onViewInvoice: (invoiceId: string) => void;
  onPayInvoice?: (invoiceId: string) => void;
  onCreateInvoice?: () => void;
  className?: string;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ 
  projectId,
  clientId,
  serviceAgentId,
  onViewInvoice,
  onPayInvoice,
  onCreateInvoice,
  className = '' 
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [sortField, setSortField] = useState<'issue_date' | 'due_date' | 'total_amount'>('issue_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let fetchedInvoices: Invoice[] = [];
        
        if (projectId) {
          fetchedInvoices = await invoiceService.getProjectInvoices(projectId);
        } else if (clientId) {
          fetchedInvoices = await invoiceService.getClientInvoices(clientId);
        } else if (serviceAgentId) {
          fetchedInvoices = await invoiceService.getServiceAgentInvoices(serviceAgentId);
        } else {
          throw new Error('Either projectId, clientId, or serviceAgentId must be provided');
        }
        
        setInvoices(fetchedInvoices);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoices();
  }, [projectId, clientId, serviceAgentId]);
  
  // Handle sending an invoice
  const handleSendInvoice = async (invoiceId: string) => {
    try {
      await invoiceService.sendInvoice(invoiceId);
      
      // Update the invoice status in the local state
      setInvoices(prevInvoices => 
        prevInvoices.map(invoice => 
          invoice.id === invoiceId 
            ? { ...invoice, status: 'sent' as InvoiceStatus } 
            : invoice
        )
      );
    } catch (err) {
      console.error('Error sending invoice:', err);
      alert(err instanceof Error ? err.message : 'Failed to send invoice');
    }
  };
  
  // Handle downloading an invoice PDF
  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const pdfUrl = await invoiceService.generateInvoicePDF(invoiceId);
      window.open(pdfUrl, '_blank');
    } catch (err) {
      console.error('Error downloading invoice:', err);
      alert(err instanceof Error ? err.message : 'Failed to download invoice');
    }
  };
  
  // Filter invoices by status and search term
  const filteredInvoices = invoices.filter(invoice => {
    // Filter by status
    if (statusFilter !== 'all' && invoice.status !== statusFilter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        invoice.invoice_number.toLowerCase().includes(searchLower) ||
        (invoice.client?.name && invoice.client.name.toLowerCase().includes(searchLower)) ||
        (invoice.service_agent?.name && invoice.service_agent.name.toLowerCase().includes(searchLower)) ||
        (invoice.project?.name && invoice.project.name.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });
  
  // Sort invoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'issue_date') {
      comparison = new Date(a.issue_date).getTime() - new Date(b.issue_date).getTime();
    } else if (sortField === 'due_date') {
      comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    } else if (sortField === 'total_amount') {
      comparison = a.total_amount - b.total_amount;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // Toggle sort direction
  const toggleSort = (field: 'issue_date' | 'due_date' | 'total_amount') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <Heading level={3}>Invoices</Heading>
            
            {onCreateInvoice && (
              <Button
                variant="primary"
                onClick={onCreateInvoice}
                className="mt-4 md:mt-0"
              >
                <FileText className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
                  className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search invoices..."
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
            ) : sortedInvoices.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400" />
                <Text variant="muted" className="mt-2">No invoices found</Text>
                {onCreateInvoice && (
                  <Button
                    variant="primary"
                    onClick={onCreateInvoice}
                    className="mt-4"
                  >
                    Create Your First Invoice
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort('issue_date')}
                      >
                        <div className="flex items-center">
                          Issue Date
                          {sortField === 'issue_date' && (
                            sortDirection === 'asc' ? 
                              <ChevronUp className="h-4 w-4 ml-1" /> : 
                              <ChevronDown className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort('due_date')}
                      >
                        <div className="flex items-center">
                          Due Date
                          {sortField === 'due_date' && (
                            sortDirection === 'asc' ? 
                              <ChevronUp className="h-4 w-4 ml-1" /> : 
                              <ChevronDown className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort('total_amount')}
                      >
                        <div className="flex items-center justify-end">
                          Amount
                          {sortField === 'total_amount' && (
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
                    {sortedInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{invoice.invoice_number}</div>
                          <div className="text-sm text-gray-500">
                            {invoice.project?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(invoice.issue_date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(invoice.due_date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {formatCurrency(invoice.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewInvoice(invoice.id)}
                              title="View Invoice"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadInvoice(invoice.id)}
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            
                            {invoice.status === 'draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSendInvoice(invoice.id)}
                                title="Send Invoice"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {(invoice.status === 'sent' || invoice.status === 'overdue') && onPayInvoice && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onPayInvoice(invoice.id)}
                                title="Pay Invoice"
                              >
                                <CreditCard className="h-4 w-4" />
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

export default InvoiceList;
