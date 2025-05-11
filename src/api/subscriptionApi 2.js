import { supabase } from '../lib/supabaseClient';
import { isUsingLocalAuth } from '../lib/supabase';

export async function getUserSubscription(userId) {
  try {
    // If using local auth, return default subscription
    if (isUsingLocalAuth()) {
      return {
        plan_id: 'pro',
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
        service_limit: 20,
        featured_listing: true
      };
    }

    // Get user's subscription from database
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(`
        id,
        plan_id,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        profiles(
          subscription_plan,
          service_limit,
          featured_listing
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no subscription found, return default values
      if (error.code === 'PGRST116') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_plan, service_limit, featured_listing')
          .eq('id', userId)
          .single();

        return {
          plan_id: profile?.subscription_plan || 'basic',
          status: 'active',
          current_period_end: null,
          cancel_at_period_end: false,
          service_limit: profile?.service_limit || 1,
          featured_listing: profile?.featured_listing || false
        };
      }
      throw error;
    }

    return {
      plan_id: subscription.plan_id,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      service_limit: subscription.profiles.service_limit,
      featured_listing: subscription.profiles.featured_listing
    };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    throw error;
  }
}

export async function getServiceCount(userId) {
  try {
    // If using local auth, return default count
    if (isUsingLocalAuth()) {
      return 3; // Default to 3 services for local development
    }

    // Get count of user's active services
    const { count, error } = await supabase
      .from('services')
      .select('id', { count: 'exact', head: true })
      .eq('service_agent_id', userId)
      .eq('status', 'active');

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('Error getting service count:', error);
    throw error;
  }
}

export async function checkServiceLimit(userId) {
  try {
    // If using local auth, return default values
    if (isUsingLocalAuth()) {
      return {
        currentCount: 3,
        limit: 20,
        canAddMore: true,
        remainingSlots: 17
      };
    }

    // Get user's subscription
    const subscription = await getUserSubscription(userId);

    // Get count of user's active services
    const serviceCount = await getServiceCount(userId);

    return {
      currentCount: serviceCount,
      limit: subscription.service_limit,
      canAddMore: serviceCount < subscription.service_limit,
      remainingSlots: Math.max(0, subscription.service_limit - serviceCount)
    };
  } catch (error) {
    console.error('Error checking service limit:', error);
    throw error;
  }
}

export async function updateUserSubscriptionPlan(userId, planId) {
  try {
    // If using local auth, just return success
    if (isUsingLocalAuth()) {
      return { success: true };
    }

    // Update user's subscription plan in profiles table
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_plan: planId,
        service_limit: getPlanServiceLimit(planId),
        featured_listing: getPlanFeaturedStatus(planId)
      })
      .eq('id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error updating user subscription plan:', error);
    throw error;
  }
}

function getPlanServiceLimit(planId) {
  switch (planId) {
    case 'basic': return 1;
    case 'plus': return 5;
    case 'family': return 10;
    case 'pro': return 20;
    case 'business': return 50;
    default: return 1;
  }
}

function getPlanFeaturedStatus(planId) {
  return ['family', 'pro', 'business'].includes(planId);
}
