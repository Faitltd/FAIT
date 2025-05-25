import { User } from '../../core/types/common';

/**
 * Payment status
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  CANCELLED = 'cancelled'
}

/**
 * Payment method type
 */
export enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  PAYPAL = 'paypal',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  CASH = 'cash',
  CHECK = 'check',
  OTHER = 'other'
}

/**
 * Payment processor
 */
export enum PaymentProcessor {
  STRIPE = 'stripe',
  SQUARE = 'square',
  PAYPAL = 'paypal',
  MANUAL = 'manual'
}

/**
 * Payment interface
 */
export interface Payment {
  id: string;
  clientId: string;
  client?: User;
  projectId?: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethodType;
  processor: PaymentProcessor;
  processorPaymentId?: string;
  processorFee?: number;
  description?: string;
  metadata?: Record<string, any>;
  refundedAmount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Credit card interface
 */
export interface CreditCard {
  id: string;
  userId: string;
  processor: PaymentProcessor;
  processorPaymentMethodId: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Bank account interface
 */
export interface BankAccount {
  id: string;
  userId: string;
  processor: PaymentProcessor;
  processorBankAccountId: string;
  last4: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Invoice status
 */
export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

/**
 * Invoice item interface
 */
export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
  discountRate?: number;
  discountAmount?: number;
  metadata?: Record<string, any>;
}

/**
 * Invoice interface
 */
export interface Invoice {
  id: string;
  clientId: string;
  client?: User;
  projectId?: string;
  number: string;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  discountRate?: number;
  discountAmount?: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  notes?: string;
  terms?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Refund interface
 */
export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  reason?: string;
  status: 'pending' | 'completed' | 'failed';
  processorRefundId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payment intent interface
 */
export interface PaymentIntent {
  id: string;
  clientId: string;
  client?: User;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  paymentMethod?: PaymentMethodType;
  processor: PaymentProcessor;
  processorPaymentIntentId?: string;
  description?: string;
  metadata?: Record<string, any>;
  clientSecret?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Subscription status
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  TRIALING = 'trialing'
}

/**
 * Subscription interface
 */
export interface Subscription {
  id: string;
  clientId: string;
  client?: User;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  endedAt?: string;
  trialStart?: string;
  trialEnd?: string;
  processor: PaymentProcessor;
  processorSubscriptionId: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Subscription plan interface
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year';
  intervalCount: number;
  trialPeriodDays?: number;
  metadata?: Record<string, any>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
