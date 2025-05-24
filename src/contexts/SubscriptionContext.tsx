import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

// Define types
interface Subscription {
  id: string;
  plan_name: string;
  plan_price: number;
  billing_cycle: 'monthly' | 'annual';
  active: boolean;
  start_date: string;
  end_date: string | null;
}

interface FeatureValue {
  enabled: boolean;
  [key: string]: any;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  error: Error | null;
  checkFeatureAccess: (featureKey: string) => Promise<{ hasAccess: boolean; featureValue: FeatureValue | null }>;
  createSubscription: (planName: string, billingCycle: 'monthly' | 'annual') => Promise<{ success: boolean; checkoutUrl?: string; message?: string }>;
  cancelSubscription: () => Promise<{ success: boolean; message: string }>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  loading: true,
  error: null,
  checkFeatureAccess: async () => ({ hasAccess: false, featureValue: null }),
  createSubscription: async () => ({ success: false }),
  cancelSubscription: async () => ({ success: false, message: 'Not implemented' }),
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user's subscription when user changes
  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        setSubscription(data || null);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  // Check if user has access to a specific feature
  const checkFeatureAccess = async (featureKey: string) => {
    try {
      if (!user) {
        return { hasAccess: false, featureValue: null };
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-feature-access`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ featureKey }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to check feature access');
      }

      const result = await response.json();
      return { 
        hasAccess: result.hasAccess, 
        featureValue: result.featureValue 
      };
    } catch (error) {
      console.error('Error checking feature access:', error);
      return { hasAccess: false, featureValue: null };
    }
  };

  // Create a new subscription
  const createSubscription = async (planName: string, billingCycle: 'monthly' | 'annual') => {
    try {
      if (!user) {
        throw new Error('User must be logged in to create a subscription');
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const successUrl = `${window.location.origin}/subscription/success`;
      const cancelUrl = `${window.location.origin}/subscription/cancel`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-subscription`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            planName, 
            billingCycle,
            successUrl,
            cancelUrl
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create subscription');
      }

      const result = await response.json();
      
      // If it's a free plan, we're done
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return { success: true, message: result.message };
      }
      
      // For paid plans, redirect to Stripe checkout
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return { success: true, checkoutUrl: result.checkoutUrl };
      }

      return { success: true };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to create subscription' 
      };
    }
  };

  // Cancel subscription
  const cancelSubscription = async () => {
    try {
      if (!user || !subscription) {
        throw new Error('No active subscription to cancel');
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      // For free plans, just deactivate in the database
      if (subscription.stripe_subscription_id === 'free_plan') {
        const { error } = await supabase
          .from('subscriptions')
          .update({ active: false })
          .eq('id', subscription.id);

        if (error) throw error;

        setSubscription(null);
        return { success: true, message: 'Free plan deactivated' };
      }

      // For paid plans, call Stripe to cancel
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-subscription`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            subscriptionId: subscription.stripe_subscription_id
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel subscription');
      }

      const result = await response.json();
      setSubscription(null);
      
      return { success: true, message: result.message || 'Subscription cancelled successfully' };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to cancel subscription' 
      };
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        error,
        checkFeatureAccess,
        createSubscription,
        cancelSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
