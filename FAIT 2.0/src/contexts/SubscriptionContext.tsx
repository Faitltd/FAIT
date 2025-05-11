import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  plan_name: string;
  plan_price: number;
  plan_interval: string;
  features: string[];
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  hasFeature: (featureName: string) => boolean;
  isSubscribed: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get subscription from database
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, plans:plan_id(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        setSubscription(null);
      } else if (data) {
        // Format subscription data
        setSubscription({
          id: data.id,
          user_id: data.user_id,
          plan_id: data.plan_id,
          status: data.status,
          current_period_end: data.current_period_end,
          cancel_at_period_end: data.cancel_at_period_end,
          plan_name: data.plans.name,
          plan_price: data.plans.price,
          plan_interval: data.plans.interval,
          features: data.plans.features || [],
        });
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const hasFeature = (featureName: string) => {
    if (!subscription) return false;
    return subscription.features.includes(featureName);
  };

  const isSubscribed = !!subscription;

  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  const value = {
    subscription,
    loading,
    hasFeature,
    isSubscribed,
    refreshSubscription,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
