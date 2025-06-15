import { writable } from 'svelte/store';

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'bank';
  isDefault: boolean;
  createdAt: string;

  // Card specific fields
  cardBrand?: string;
  last4?: string;
  expiryMonth?: string;
  expiryYear?: string;

  // Bank specific fields
  bankName?: string;
  accountLast4?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: 'payment' | 'refund' | 'payout';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  paymentMethodId?: string;
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentsState {
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PaymentsState = {
  paymentMethods: [],
  transactions: [],
  isLoading: false,
  error: null
};

function createPaymentsStore() {
  const { subscribe, set, update } = writable<PaymentsState>(initialState);

  return {
    subscribe,

    // Load user payment methods
    async loadUserPaymentMethods(userId: string) {
      update(state => ({ ...state, isLoading: true, error: null }));

      try {
        // Mock data for demo
        const mockPaymentMethods: PaymentMethod[] = [
          {
            id: '1',
            userId,
            type: 'card',
            isDefault: true,
            cardBrand: 'Visa',
            last4: '4242',
            expiryMonth: '12',
            expiryYear: '25',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            userId,
            type: 'bank',
            isDefault: false,
            bankName: 'Chase Bank',
            accountLast4: '1234',
            createdAt: new Date().toISOString()
          }
        ];

        update(state => ({
          ...state,
          paymentMethods: mockPaymentMethods,
          isLoading: false
        }));

        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load payment methods';
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));

        return { success: false, error: errorMessage };
      }
    },

    // Load user transactions
    async loadUserTransactions(userId: string) {
      try {
        // Mock data for demo
        const mockTransactions: Transaction[] = [
          {
            id: '1',
            userId,
            amount: 150.00,
            currency: 'USD',
            type: 'payment',
            status: 'completed',
            description: 'Plumbing Service - Kitchen Sink Repair',
            paymentMethodId: '1',
            bookingId: 'booking-1',
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            updatedAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '2',
            userId,
            amount: 75.00,
            currency: 'USD',
            type: 'payment',
            status: 'completed',
            description: 'Handyman Service - Picture Hanging',
            paymentMethodId: '1',
            bookingId: 'booking-2',
            createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            updatedAt: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: '3',
            userId,
            amount: 25.00,
            currency: 'USD',
            type: 'refund',
            status: 'completed',
            description: 'Partial refund for cancelled service',
            paymentMethodId: '1',
            bookingId: 'booking-3',
            createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            updatedAt: new Date(Date.now() - 259200000).toISOString()
          }
        ];

        update(state => ({
          ...state,
          transactions: mockTransactions
        }));

        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load transactions';
        update(state => ({
          ...state,
          error: errorMessage
        }));

        return { success: false, error: errorMessage };
      }
    },

    // Add payment method
    async addPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id' | 'createdAt'>) {
      update(state => ({ ...state, isLoading: true, error: null }));

      try {
        const newPaymentMethod: PaymentMethod = {
          ...paymentMethod,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString()
        };

        update(state => ({
          ...state,
          paymentMethods: [...state.paymentMethods, newPaymentMethod],
          isLoading: false
        }));

        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add payment method';
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));

        return { success: false, error: errorMessage };
      }
    },

    // Remove payment method
    async removePaymentMethod(id: string) {
      update(state => ({ ...state, isLoading: true, error: null }));

      try {
        update(state => ({
          ...state,
          paymentMethods: state.paymentMethods.filter(method => method.id !== id),
          isLoading: false
        }));

        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to remove payment method';
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));

        return { success: false, error: errorMessage };
      }
    },

    // Set default payment method
    async setDefaultPaymentMethod(id: string) {
      update(state => ({ ...state, isLoading: true, error: null }));

      try {
        update(state => ({
          ...state,
          paymentMethods: state.paymentMethods.map(method => ({
            ...method,
            isDefault: method.id === id
          })),
          isLoading: false
        }));

        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to set default payment method';
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));

        return { success: false, error: errorMessage };
      }
    },

    // Reset store
    reset() {
      set(initialState);
    }
  };
}

export const payments = createPaymentsStore();
