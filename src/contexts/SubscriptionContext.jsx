import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getUserSubscription, getServiceCount } from '../api/subscriptionApi';

// Supabase client is now imported from lib/supabaseClient.js

const SubscriptionContext = createContext();

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }) {
  const [subscription, setSubscription] = useState(null);
  const [serviceCount, setServiceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current user
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        fetchSubscriptionData(user.id);
      } else {
        setLoading(false);
      }
    };

    fetchUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          fetchSubscriptionData(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSubscription(null);
          setServiceCount(0);
        }
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const fetchSubscriptionData = async (userId) => {
    try {
      setLoading(true);

      try {
        // Get user's subscription
        const subscriptionData = await getUserSubscription(userId);
        setSubscription(subscriptionData || {
          // Default subscription data
          status: 'active',
          plan_id: 'basic',
          service_limit: 3,
          featured_listing: false
        });
      } catch (subErr) {
        console.warn('Error fetching subscription, using defaults:', subErr);
        setSubscription({
          status: 'active',
          plan_id: 'basic',
          service_limit: 3,
          featured_listing: false
        });
      }

      try {
        // Get count of user's active services
        const count = await getServiceCount(userId);
        setServiceCount(count || 0);
      } catch (countErr) {
        console.warn('Error fetching service count, using default:', countErr);
        setServiceCount(0);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      setError('Failed to load subscription data');
      // Set defaults even on error
      setSubscription({
        status: 'active',
        plan_id: 'basic',
        service_limit: 3,
        featured_listing: false
      });
      setServiceCount(0);
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscriptionData = async () => {
    if (user) {
      await fetchSubscriptionData(user.id);
    }
  };

  const canAddService = () => {
    if (!subscription) return false;
    return serviceCount < subscription.service_limit;
  };

  const getRemainingServiceSlots = () => {
    if (!subscription) return 0;
    return Math.max(0, subscription.service_limit - serviceCount);
  };

  const value = {
    subscription,
    serviceCount,
    loading,
    error,
    canAddService,
    getRemainingServiceSlots,
    refreshSubscriptionData,
    hasFeaturedListing: subscription?.featured_listing || false,
    isSubscriptionActive: subscription?.status === 'active',
    currentPlan: subscription?.plan_id || 'basic'
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
