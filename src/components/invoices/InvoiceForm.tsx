import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { invoiceService } from '../../services/invoiceService';
import { InvoiceRequest, InvoiceLineItem } from '../../types/invoice';
import { formatCurrency } from '../../utils/formatters';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
  Heading, 
  Input,
  ExpandingTextarea,
  Select,
  Button,
  DatePicker
} from '../ui';
import { Plus, Trash2, Save, Send } from 'lucide-react';

interface InvoiceFormProps {
  projectId: string;
  clientId: string;
  serviceAgentId: string;
  onInvoiceCreated?: (invoiceId: string) => void;
  onCancel?: () => void;
  className?: string;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ 
  projectId,
  clientId,
  serviceAgentId,
  onInvoiceCreated,
  onCancel,
  className = '' 
}) => {
  const [lineItems, setLineItems] = useState<Omit<InvoiceLineItem, 'id' | 'invoice_id' | 'created_at' | 'updated_at'>[]>([
    {
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_rate: 0,
      discount_amount: 0,
      total: 0
    }
  ]);
  
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('Payment due within 30 days of invoice date.');
  const [issueDate, setIssueDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { user } = useAuth();
  
  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
  const totalTax = lineItems.reduce((sum, item) => {
    const itemTax = item.tax_rate ? (item.total * (item.tax_rate / 100)) : 0;
    return sum + itemTax;
  }, 0);
  const totalDiscount = lineItems.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
  const total = subtotal + totalTax - totalDiscount;
  
  // Update line item total when quantity or unit price changes
  const updateLineItemTotal = (index: number, quantity: number, unitPrice: number, taxRate: number, discountAmount: number) => {
    const newLineItems = [...lineItems];
    const subtotal = quantity * unitPrice;
    newLineItems[index] = {
      ...newLineItems[index],
      quantity,
      unit_price: unitPrice,
      tax_rate: taxRate,
      discount_amount: discountAmount,
      total: subtotal
    };
    setLineItems(newLineItems);
  };
  
  // Add a new line item
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        description: '',
        quantity: 1,
        unit_price: 0,
        tax_rate: 0,
        discount_amount: 0,
        total: 0
      }
    ]);
  };
  
  // Remove a line item
  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) {
      // Don't remove the last line item
      return;
    }
    
    const newLineItems = [...lineItems];
    newLineItems.splice(index, 1);
    setLineItems(newLineItems);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent, sendImmediately = false) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create an invoice');
      return;
    }
    
    // Validate line items
    const invalidLineItems = lineItems.filter(item => !item.description || item.quantity <= 0);
    if (invalidLineItems.length > 0) {
      setError('All line items must have a description and a quantity greater than zero');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      // Create invoice request
      const invoiceRequest: InvoiceRequest = {
        project_id: projectId,
        client_id: clientId,
        service_agent_id: serviceAgentId,
        amount: subtotal,
        tax_amount: totalTax,
        discount_amount: totalDiscount,
        currency: 'USD',
        issue_date: issueDate.toISOString(),
        due_date: dueDate.toISOString(),
        notes,
        terms,
        line_items: lineItems
      };
      
      // Create invoice
      const invoice = await invoiceService.createInvoice(invoiceRequest);
      
      // If sendImmediately is true, send the invoice
      if (sendImmediately) {
        await invoiceService.sendInvoice(invoice.id);
        setSuccessMessage('Invoice created and sent successfully!');
      } else {
        setSuccessMessage('Invoice created successfully!');
      }
      
      // Call the callback if provided
      if (onInvoiceCreated) {
        onInvoiceCreated(invoice.id);
      }
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={className}>
      <Card>
        <form onSubmit={(e) => handleSubmit(e, false)}>
          <CardHeader>
            <Heading level={3}>Create Invoice</Heading>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <DatePicker
                    label="Issue Date"
                    value={issueDate}
                    onChange={setIssueDate}
                    required
                  />
                </div>
                
                <div>
                  <DatePicker
                    label="Due Date"
                    value={dueDate}
                    onChange={setDueDate}
                    required
                  />
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Rate (%)</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lineItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          <Input
                            value={item.description}
                            onChange={(e) => {
                              const newLineItems = [...lineItems];
                              newLineItems[index].description = e.target.value;
                              setLineItems(newLineItems);
                            }}
                            placeholder="Description"
                            required
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const quantity = parseFloat(e.target.value) || 0;
                              updateLineItemTotal(
                                index, 
                                quantity, 
                                item.unit_price, 
                                item.tax_rate || 0, 
                                item.discount_amount || 0
                              );
                            }}
                            min="1"
                            step="1"
                            required
                            className="text-right"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => {
                              const unitPrice = parseFloat(e.target.value) || 0;
                              updateLineItemTotal(
                                index, 
                                item.quantity, 
                                unitPrice, 
                                item.tax_rate || 0, 
                                item.discount_amount || 0
                              );
                            }}
                            min="0"
                            step="0.01"
                            required
                            className="text-right"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            value={item.tax_rate || 0}
                            onChange={(e) => {
                              const taxRate = parseFloat(e.target.value) || 0;
                              updateLineItemTotal(
                                index, 
                                item.quantity, 
                                item.unit_price, 
                                taxRate, 
                                item.discount_amount || 0
                              );
                            }}
                            min="0"
                            max="100"
                            step="0.1"
                            className="text-right"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            value={item.discount_amount || 0}
                            onChange={(e) => {
                              const discountAmount = parseFloat(e.target.value) || 0;
                              updateLineItemTotal(
                                index, 
                                item.quantity, 
                                item.unit_price, 
                                item.tax_rate || 0, 
                                discountAmount
                              );
                            }}
                            min="0"
                            step="0.01"
                            className="text-right"
                          />
                        </td>
                        <td className="px-4 py-2 text-right">
                          {formatCurrency(item.total || 0)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(index)}
                            disabled={lineItems.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={7} className="px-4 py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={addLineItem}
                          className="flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Line Item
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="px-4 py-2 text-right font-medium">Subtotal:</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(subtotal)}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="px-4 py-2 text-right font-medium">Tax:</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(totalTax)}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="px-4 py-2 text-right font-medium">Discount:</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(totalDiscount)}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={5} className="px-4 py-2 text-right font-medium text-lg">Total:</td>
                      <td className="px-4 py-2 text-right font-bold text-lg">{formatCurrency(total)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div>
                <ExpandingTextarea
                  label="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes for the client..."
                  minRows={3}
                />
              </div>
              
              <div>
                <ExpandingTextarea
                  label="Terms"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Payment terms and conditions..."
                  minRows={2}
                />
              </div>
              
              {error && (
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
              )}
              
              {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{successMessage}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter>
            <div className="flex justify-end space-x-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, true)}
                isLoading={isLoading}
                disabled={isLoading}
              >
                <Send className="h-4 w-4 mr-2" />
                Save & Send
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default InvoiceForm;
