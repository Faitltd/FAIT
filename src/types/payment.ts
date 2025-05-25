/**
 * Payment and Invoice Types for the FAIT Co-op Platform
 */

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'square' | 'stripe';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

/**
 * Payment interface
 */
export interface Payment {
  id: string;
  project_id: string;
  invoice_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  payment_processor: 'stripe' | 'square';
  payment_intent_id?: string;
  payment_method_id?: string;
  receipt_url?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  project?: any;
  invoice?: Invoice;
}

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
  payments?: Payment[];
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
 * Payment request interface
 */
export interface PaymentRequest {
  project_id: string;
  invoice_id?: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_processor: 'stripe' | 'square';
  client_id: string;
  service_agent_id: string;
  description?: string;
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
