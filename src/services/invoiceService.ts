import { supabase } from '../lib/supabase';
import { 
  Invoice, 
  InvoiceRequest, 
  InvoiceStatus
} from '../types/invoice';

/**
 * Service for managing invoices
 */
class InvoiceService {
  /**
   * Create an invoice
   * @param invoiceRequest Invoice request data
   * @returns Created invoice
   */
  async createInvoice(invoiceRequest: InvoiceRequest): Promise<Invoice> {
    try {
      // Calculate total amount
      const totalAmount = this.calculateInvoiceTotal(
        invoiceRequest.amount,
        invoiceRequest.tax_amount || 0,
        invoiceRequest.discount_amount || 0
      );
      
      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();
      
      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          project_id: invoiceRequest.project_id,
          invoice_number: invoiceNumber,
          client_id: invoiceRequest.client_id,
          service_agent_id: invoiceRequest.service_agent_id,
          amount: invoiceRequest.amount,
          tax_amount: invoiceRequest.tax_amount,
          discount_amount: invoiceRequest.discount_amount,
          total_amount: totalAmount,
          currency: invoiceRequest.currency,
          status: 'draft' as InvoiceStatus,
          issue_date: invoiceRequest.issue_date,
          due_date: invoiceRequest.due_date,
          notes: invoiceRequest.notes,
          terms: invoiceRequest.terms,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;
      
      // Create line items
      if (invoiceRequest.line_items && invoiceRequest.line_items.length > 0) {
        const lineItemsWithInvoiceId = invoiceRequest.line_items.map(item => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate,
          discount_amount: item.discount_amount,
          total: item.total,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        const { error: lineItemsError } = await supabase
          .from('invoice_line_items')
          .insert(lineItemsWithInvoiceId);
        
        if (lineItemsError) throw lineItemsError;
      }
      
      return invoice as Invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }
  
  /**
   * Get invoices for a project
   * @param projectId Project ID
   * @returns Array of invoices
   */
  async getProjectInvoices(projectId: string): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:client_id(*),
          service_agent:service_agent_id(*),
          line_items:invoice_line_items(*),
          payments(*)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as Invoice[];
    } catch (error) {
      console.error('Error getting project invoices:', error);
      throw error;
    }
  }
  
  /**
   * Get invoices for a client
   * @param clientId Client ID
   * @returns Array of invoices
   */
  async getClientInvoices(clientId: string): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          project:project_id(*),
          service_agent:service_agent_id(*),
          line_items:invoice_line_items(*),
          payments(*)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as Invoice[];
    } catch (error) {
      console.error('Error getting client invoices:', error);
      throw error;
    }
  }
  
  /**
   * Get invoices for a service agent
   * @param serviceAgentId Service agent ID
   * @returns Array of invoices
   */
  async getServiceAgentInvoices(serviceAgentId: string): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          project:project_id(*),
          client:client_id(*),
          line_items:invoice_line_items(*),
          payments(*)
        `)
        .eq('service_agent_id', serviceAgentId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as Invoice[];
    } catch (error) {
      console.error('Error getting service agent invoices:', error);
      throw error;
    }
  }
  
  /**
   * Get an invoice by ID
   * @param invoiceId Invoice ID
   * @returns Invoice data
   */
  async getInvoiceById(invoiceId: string): Promise<Invoice> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:client_id(*),
          service_agent:service_agent_id(*),
          project:project_id(*),
          line_items:invoice_line_items(*),
          payments(*)
        `)
        .eq('id', invoiceId)
        .single();
      
      if (error) throw error;
      
      return data as Invoice;
    } catch (error) {
      console.error('Error getting invoice:', error);
      throw error;
    }
  }
  
  /**
   * Update invoice status
   * @param invoiceId Invoice ID
   * @param status New status
   * @returns Updated invoice
   */
  async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus): Promise<Invoice> {
    try {
      const updates: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      // If status is paid, set paid_date
      if (status === 'paid') {
        updates.paid_date = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', invoiceId)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as Invoice;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  }
  
  /**
   * Generate a PDF invoice
   * @param invoiceId Invoice ID
   * @returns PDF file URL
   */
  async generateInvoicePDF(invoiceId: string): Promise<string> {
    try {
      // Get the session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication session expired');
      }
      
      // Call the invoice PDF generation function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-invoice-pdf`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ invoiceId })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate invoice PDF');
      }
      
      const data = await response.json();
      return data.pdfUrl;
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw error;
    }
  }
  
  /**
   * Send an invoice to the client
   * @param invoiceId Invoice ID
   * @returns Success status
   */
  async sendInvoice(invoiceId: string): Promise<{ success: boolean }> {
    try {
      // Get the session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication session expired');
      }
      
      // Call the send invoice function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invoice`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ invoiceId })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invoice');
      }
      
      // Update invoice status to sent
      await this.updateInvoiceStatus(invoiceId, 'sent');
      
      return { success: true };
    } catch (error) {
      console.error('Error sending invoice:', error);
      throw error;
    }
  }
  
  /**
   * Calculate invoice total
   * @param amount Base amount
   * @param taxAmount Tax amount
   * @param discountAmount Discount amount
   * @returns Total amount
   */
  private calculateInvoiceTotal(amount: number, taxAmount: number, discountAmount: number): number {
    return amount + taxAmount - discountAmount;
  }
  
  /**
   * Generate a unique invoice number
   * @returns Invoice number
   */
  private async generateInvoiceNumber(): Promise<string> {
    try {
      // Get the current date
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      
      // Get the latest invoice number with the same prefix
      const prefix = `INV-${year}${month}-`;
      
      const { data, error } = await supabase
        .from('invoices')
        .select('invoice_number')
        .ilike('invoice_number', `${prefix}%`)
        .order('invoice_number', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      let sequenceNumber = 1;
      
      if (data && data.length > 0) {
        // Extract the sequence number from the latest invoice number
        const latestInvoiceNumber = data[0].invoice_number;
        const latestSequenceNumber = parseInt(latestInvoiceNumber.split('-')[2], 10);
        
        if (!isNaN(latestSequenceNumber)) {
          sequenceNumber = latestSequenceNumber + 1;
        }
      }
      
      // Format the sequence number with leading zeros
      const formattedSequenceNumber = sequenceNumber.toString().padStart(4, '0');
      
      return `${prefix}${formattedSequenceNumber}`;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback to a timestamp-based invoice number
      const timestamp = Date.now().toString();
      return `INV-${timestamp}`;
    }
  }
}

export const invoiceService = new InvoiceService();
