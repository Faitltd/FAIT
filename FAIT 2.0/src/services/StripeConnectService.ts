import { supabase } from '../lib/supabase';

/**
 * Service for handling Stripe Connect operations
 */
export class StripeConnectService {
  /**
   * Create a Stripe Connect account for a contractor
   * @param userId The user ID to create the account for
   * @param params Parameters for creating the account
   * @returns The created account ID
   */
  async createConnectAccount(userId: string, params: {
    country: string;
    email: string;
    business_type?: 'individual' | 'company';
  }) {
    const { data, error } = await supabase.functions.invoke('stripe-connect', {
      body: {
        action: 'create_connect_account',
        userId,
        ...params
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Create an account link for onboarding or updating a Stripe Connect account
   * @param userId The user ID to create the account link for
   * @param params Parameters for creating the account link
   * @returns The account link URL
   */
  async createAccountLink(userId: string, params: {
    return_url: string;
    refresh_url: string;
    type?: 'account_onboarding' | 'account_update';
  }) {
    const { data, error } = await supabase.functions.invoke('stripe-connect', {
      body: {
        action: 'create_account_link',
        userId,
        ...params
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Get the balance for a Stripe Connect account
   * @param userId The user ID to get the balance for
   * @returns The account balance
   */
  async getAccountBalance(userId: string) {
    const { data, error } = await supabase.functions.invoke('stripe-connect', {
      body: {
        action: 'get_account_balance',
        userId
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Create a payout for a Stripe Connect account
   * @param userId The user ID to create the payout for
   * @param params Parameters for creating the payout
   * @returns The created payout
   */
  async createPayout(userId: string, params: {
    amount: number;
    currency?: string;
  }) {
    const { data, error } = await supabase.functions.invoke('stripe-connect', {
      body: {
        action: 'create_payout',
        userId,
        ...params
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Get details for a Stripe Connect account
   * @param userId The user ID to get the account details for
   * @returns The account details
   */
  async getAccountDetails(userId: string) {
    const { data, error } = await supabase.functions.invoke('stripe-connect', {
      body: {
        action: 'get_account_details',
        userId
      }
    });

    if (error) throw error;
    return data;
  }
}

export const stripeConnectService = new StripeConnectService();
