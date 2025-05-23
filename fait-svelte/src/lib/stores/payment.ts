import { writable, derived } from 'svelte/store';
import { paymentService } from '$lib/services/payment';
import type { PaymentMethod, PaymentIntent, Payment } from '$lib/services/payment';
import { auth } from './auth';
import { get } from 'svelte/store';

// Initial state
const initialState = {
  paymentMethods: [] as PaymentMethod[],
  currentPaymentIntent: null as PaymentIntent | null,
  isLoading: false,
  error: null as string | null
};

// Create the store
const createPaymentStore = () => {
  const { subscribe, set, update } = writable(initialState);

  // Create derived store for default payment method
  const defaultPaymentMethod = derived({ subscribe }, $payment => 
    $payment.paymentMethods.find(method => method.isDefault) || null
  );

  return {
    subscribe,
    defaultPaymentMethod,
    
    // Load payment methods for the current user
    loadPaymentMethods: async () => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const authState = get(auth);
        
        if (!authState.user) {
          throw new Error('User not authenticated');
        }
        
        const paymentMethods = await paymentService.getPaymentMethods(authState.user.id);
        
        update(state => ({
          ...state,
          paymentMethods,
          isLoading: false,
          error: null
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
    
    // Add a payment method
    addPaymentMethod: async (paymentMethodId: string) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const authState = get(auth);
        
        if (!authState.user) {
          throw new Error('User not authenticated');
        }
        
        const paymentMethod = await paymentService.addPaymentMethod(authState.user.id, paymentMethodId);
        
        update(state => ({
          ...state,
          paymentMethods: [...state.paymentMethods, paymentMethod],
          isLoading: false,
          error: null
        }));
        
        return { success: true, paymentMethod };
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
    
    // Set default payment method
    setDefaultPaymentMethod: async (paymentMethodId: string) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const authState = get(auth);
        
        if (!authState.user) {
          throw new Error('User not authenticated');
        }
        
        const paymentMethod = await paymentService.setDefaultPaymentMethod(authState.user.id, paymentMethodId);
        
        update(state => {
          const updatedPaymentMethods = state.paymentMethods.map(method => ({
            ...method,
            isDefault: method.id === paymentMethodId
          }));
          
          return {
            ...state,
            paymentMethods: updatedPaymentMethods,
            isLoading: false,
            error: null
          };
        });
        
        return { success: true, paymentMethod };
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
    
    // Remove a payment method
    removePaymentMethod: async (paymentMethodId: string) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const authState = get(auth);
        
        if (!authState.user) {
          throw new Error('User not authenticated');
        }
        
        await paymentService.removePaymentMethod(authState.user.id, paymentMethodId);
        
        update(state => ({
          ...state,
          paymentMethods: state.paymentMethods.filter(method => method.id !== paymentMethodId),
          isLoading: false,
          error: null
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
    
    // Create a payment intent
    createPaymentIntent: async (bookingId: string, amount: number, currency = 'usd') => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const paymentIntent = await paymentService.createPaymentIntent(bookingId, amount, currency);
        
        update(state => ({
          ...state,
          currentPaymentIntent: paymentIntent,
          isLoading: false,
          error: null
        }));
        
        return { success: true, paymentIntent };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create payment intent';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Process a payment
    processPayment: async (bookingId: string, paymentMethodId: string, amount: number, currency = 'usd') => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const payment = await paymentService.processPayment(bookingId, paymentMethodId, amount, currency);
        
        update(state => ({
          ...state,
          currentPaymentIntent: null,
          isLoading: false,
          error: null
        }));
        
        return { success: true, payment };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to process payment';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Get payment by booking ID
    getPaymentByBookingId: async (bookingId: string) => {
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const payment = await paymentService.getPaymentByBookingId(bookingId);
        
        update(state => ({
          ...state,
          isLoading: false,
          error: null
        }));
        
        return { success: true, payment };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to get payment';
        
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));
        
        return { success: false, error: errorMessage };
      }
    },
    
    // Clear error
    clearError: () => {
      update(state => ({ ...state, error: null }));
    },
    
    // Reset store
    reset: () => {
      set(initialState);
    }
  };
};

// Export the store
export const payment = createPaymentStore();
