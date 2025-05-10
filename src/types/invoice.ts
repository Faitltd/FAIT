/**
 * Invoice Types for the FAIT Co-op Platform
 */

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

/**
 * Invoice interface
 */
export interface Invoice {
  id: string;
  project_id: string;
  invoice_number: string;
  client_id: string;
  service_agent_id: string;
  amount: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  currency: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  paid_date?: string;
  notes?: string;
  terms?: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  project?: any;
  client?: any;
  service_agent?: any;
  line_items?: InvoiceLineItem[];
  payments?: any[];
}

/**
 * Invoice line item interface
 */
export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  discount_amount?: number;
  total: number;
  created_at: string;
  updated_at: string;
}

/**
 * Invoice creation request interface
 */
export interface InvoiceRequest {
  project_id: string;
  client_id: string;
  service_agent_id: string;
  amount: number;
  tax_amount?: number;
  discount_amount?: number;
  currency: string;
  issue_date: string;
  due_date: string;
  notes?: string;
  terms?: string;
  line_items: Omit<InvoiceLineItem, 'id' | 'invoice_id' | 'created_at' | 'updated_at'>[];
}
