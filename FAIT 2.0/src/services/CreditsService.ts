import { supabase } from '../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the public key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

// Types
export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  savings?: string;
}

export interface CreditBalance {
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  description: string;
  stripe_session_id: string | null;
  created_at: string;
}

// Default credit packages
const DEFAULT_CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'credits-100', name: '100 Credits', credits: 100, price: 9.99, popular: false },
  { id: 'credits-500', name: '500 Credits', credits: 500, price: 39.99, popular: true, savings: '20%' },
  { id: 'credits-1000', name: '1000 Credits', credits: 1000, price: 69.99, popular: false, savings: '30%' },
];

// Service class
class CreditsService {
  /**
   * Get credit packages available for purchase
   */
  async getCreditPackages(): Promise<CreditPackage[]> {
    try {
      // Try to fetch from API
      const response = await fetch('/api/credit-packages');
      if (response.ok) {
        return await response.json();
      }
      
      // Fallback to default packages
      return DEFAULT_CREDIT_PACKAGES;
    } catch (error) {
      console.error('Error fetching credit packages:', error);
      return DEFAULT_CREDIT_PACKAGES;
    }
  }

  /**
   * Get user's credit balance
   */
  async getCreditBalance(userId: string): Promise<CreditBalance> {
    try {
      // Get current credits
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();
        
      if (userError) throw userError;
      
      // Get lifetime earned (sum of positive transactions)
      const { data: earnedData, error: earnedError } = await supabase
        .from('credit_transactions')
        .select('amount')
        .eq('user_id', userId)
        .gte('amount', 0);
        
      if (earnedError) throw earnedError;
      
      // Get lifetime spent (sum of negative transactions)
      const { data: spentData, error: spentError } = await supabase
        .from('credit_transactions')
        .select('amount')
        .eq('user_id', userId)
        .lt('amount', 0);
        
      if (spentError) throw spentError;
      
      // Calculate totals
      const lifetimeEarned = earnedData.reduce((sum, tx) => sum + tx.amount, 0);
      const lifetimeSpent = Math.abs(spentData.reduce((sum, tx) => sum + tx.amount, 0));
      
      return {
        balance: userData.credits || 0,
        lifetime_earned: lifetimeEarned,
        lifetime_spent: lifetimeSpent
      };
    } catch (error) {
      console.error('Error fetching credit balance:', error);
      throw error;
    }
  }

  /**
   * Get user's credit transactions
   */
  async getCreditTransactions(userId: string, limit: number = 10): Promise<CreditTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching credit transactions:', error);
      throw error;
    }
  }

  /**
   * Create a checkout session for purchasing credits
   */
  async createCheckoutSession(
    userId: string,
    email: string,
    packageId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    try {
      // Create checkout session via API
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: packageId,
          email,
          successUrl,
          cancelUrl,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }
      
      const { sessionId } = await response.json();
      return sessionId;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Redirect to Stripe Checkout
   */
  async redirectToCheckout(sessionId: string): Promise<void> {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }
      
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const creditsService = new CreditsService();
