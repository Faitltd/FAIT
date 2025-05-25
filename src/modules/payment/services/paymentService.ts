import { apiService } from '../../core/services/apiService';
import { 
  Payment, 
  Invoice, 
  CreditCard, 
  BankAccount, 
  Refund, 
  PaymentIntent,
  Subscription,
  SubscriptionPlan,
  PaymentMethodType,
  PaymentProcessor
} from '../types/payment';
import { ApiResponse, PaginatedResult, QueryParams } from '../../core/types/common';

/**
 * Payment service for managing payments
 */
class PaymentService {
  private baseEndpoint = '/payments';
  private stripePublicKey: string = '';
  private squareApplicationId: string = '';

  /**
   * Set Stripe public key
   */
  setStripePublicKey(key: string): void {
    this.stripePublicKey = key;
  }

  /**
   * Get Stripe public key
   */
  getStripePublicKey(): string {
    return this.stripePublicKey;
  }

  /**
   * Set Square application ID
   */
  setSquareApplicationId(id: string): void {
    this.squareApplicationId = id;
  }

  /**
   * Get Square application ID
   */
  getSquareApplicationId(): string {
    return this.squareApplicationId;
  }

  /**
   * Get all payments
   */
  async getPayments(params?: QueryParams): Promise<ApiResponse<PaginatedResult<Payment>>> {
    return apiService.get<PaginatedResult<Payment>>(this.baseEndpoint, params);
  }

  /**
   * Get a payment by ID
   */
  async getPayment(id: string): Promise<ApiResponse<Payment>> {
    return apiService.get<Payment>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Create a payment
   */
  async createPayment(payment: Partial<Payment>): Promise<ApiResponse<Payment>> {
    return apiService.post<Payment>(this.baseEndpoint, payment);
  }

  /**
   * Update a payment
   */
  async updatePayment(id: string, payment: Partial<Payment>): Promise<ApiResponse<Payment>> {
    return apiService.put<Payment>(`${this.baseEndpoint}/${id}`, payment);
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId: string, amount: number, reason?: string): Promise<ApiResponse<Refund>> {
    return apiService.post<Refund>(`${this.baseEndpoint}/${paymentId}/refund`, {
      amount,
      reason,
    });
  }

  /**
   * Get all invoices
   */
  async getInvoices(params?: QueryParams): Promise<ApiResponse<PaginatedResult<Invoice>>> {
    return apiService.get<PaginatedResult<Invoice>>('/invoices', params);
  }

  /**
   * Get an invoice by ID
   */
  async getInvoice(id: string): Promise<ApiResponse<Invoice>> {
    return apiService.get<Invoice>(`/invoices/${id}`);
  }

  /**
   * Create an invoice
   */
  async createInvoice(invoice: Partial<Invoice>): Promise<ApiResponse<Invoice>> {
    return apiService.post<Invoice>('/invoices', invoice);
  }

  /**
   * Update an invoice
   */
  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<ApiResponse<Invoice>> {
    return apiService.put<Invoice>(`/invoices/${id}`, invoice);
  }

  /**
   * Delete an invoice
   */
  async deleteInvoice(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/invoices/${id}`);
  }

  /**
   * Send an invoice
   */
  async sendInvoice(id: string, email: string): Promise<ApiResponse<Invoice>> {
    return apiService.post<Invoice>(`/invoices/${id}/send`, { email });
  }

  /**
   * Mark an invoice as paid
   */
  async markInvoiceAsPaid(id: string, paymentId?: string): Promise<ApiResponse<Invoice>> {
    return apiService.post<Invoice>(`/invoices/${id}/mark-paid`, { paymentId });
  }

  /**
   * Get all credit cards
   */
  async getCreditCards(): Promise<ApiResponse<CreditCard[]>> {
    return apiService.get<CreditCard[]>('/payment-methods/credit-cards');
  }

  /**
   * Add a credit card
   */
  async addCreditCard(
    token: string,
    processor: PaymentProcessor,
    isDefault: boolean = false
  ): Promise<ApiResponse<CreditCard>> {
    return apiService.post<CreditCard>('/payment-methods/credit-cards', {
      token,
      processor,
      isDefault,
    });
  }

  /**
   * Update a credit card
   */
  async updateCreditCard(id: string, isDefault: boolean): Promise<ApiResponse<CreditCard>> {
    return apiService.put<CreditCard>(`/payment-methods/credit-cards/${id}`, {
      isDefault,
    });
  }

  /**
   * Delete a credit card
   */
  async deleteCreditCard(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/payment-methods/credit-cards/${id}`);
  }

  /**
   * Get all bank accounts
   */
  async getBankAccounts(): Promise<ApiResponse<BankAccount[]>> {
    return apiService.get<BankAccount[]>('/payment-methods/bank-accounts');
  }

  /**
   * Add a bank account
   */
  async addBankAccount(
    token: string,
    processor: PaymentProcessor,
    isDefault: boolean = false
  ): Promise<ApiResponse<BankAccount>> {
    return apiService.post<BankAccount>('/payment-methods/bank-accounts', {
      token,
      processor,
      isDefault,
    });
  }

  /**
   * Update a bank account
   */
  async updateBankAccount(id: string, isDefault: boolean): Promise<ApiResponse<BankAccount>> {
    return apiService.put<BankAccount>(`/payment-methods/bank-accounts/${id}`, {
      isDefault,
    });
  }

  /**
   * Delete a bank account
   */
  async deleteBankAccount(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/payment-methods/bank-accounts/${id}`);
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    description?: string,
    metadata?: Record<string, any>
  ): Promise<ApiResponse<PaymentIntent>> {
    return apiService.post<PaymentIntent>('/payment-intents', {
      amount,
      currency,
      description,
      metadata,
    });
  }

  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<ApiResponse<PaymentIntent>> {
    return apiService.post<PaymentIntent>(`/payment-intents/${paymentIntentId}/confirm`, {
      paymentMethodId,
    });
  }

  /**
   * Get all subscriptions
   */
  async getSubscriptions(params?: QueryParams): Promise<ApiResponse<PaginatedResult<Subscription>>> {
    return apiService.get<PaginatedResult<Subscription>>('/subscriptions', params);
  }

  /**
   * Get a subscription by ID
   */
  async getSubscription(id: string): Promise<ApiResponse<Subscription>> {
    return apiService.get<Subscription>(`/subscriptions/${id}`);
  }

  /**
   * Create a subscription
   */
  async createSubscription(
    planId: string,
    paymentMethodId: string,
    metadata?: Record<string, any>
  ): Promise<ApiResponse<Subscription>> {
    return apiService.post<Subscription>('/subscriptions', {
      planId,
      paymentMethodId,
      metadata,
    });
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    id: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<ApiResponse<Subscription>> {
    return apiService.post<Subscription>(`/subscriptions/${id}/cancel`, {
      cancelAtPeriodEnd,
    });
  }

  /**
   * Get all subscription plans
   */
  async getSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    return apiService.get<SubscriptionPlan[]>('/subscription-plans');
  }

  /**
   * Get a subscription plan by ID
   */
  async getSubscriptionPlan(id: string): Promise<ApiResponse<SubscriptionPlan>> {
    return apiService.get<SubscriptionPlan>(`/subscription-plans/${id}`);
  }
}

// Create and export a singleton instance
export const paymentService = new PaymentService();
