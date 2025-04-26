import { createClient } from '@supabase/supabase-js';
import { checkServiceLimit } from './subscriptionApi';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function validateServiceCreation(userId) {
  try {
    // Check if user has reached their service limit
    const { canAddMore, currentCount, limit } = await checkServiceLimit(userId);
    
    if (!canAddMore) {
      return {
        canCreate: false,
        currentCount,
        limit,
        message: `You have reached your service limit (${currentCount}/${limit}). Please upgrade your subscription to add more services.`
      };
    }
    
    return {
      canCreate: true,
      currentCount,
      limit,
      message: `You can create ${limit - currentCount} more service${limit - currentCount !== 1 ? 's' : ''}.`
    };
  } catch (error) {
    console.error('Error validating service creation:', error);
    throw error;
  }
}

export async function getServiceLimitInfo(userId) {
  try {
    // Get user's subscription
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_plan, service_limit')
      .eq('id', userId)
      .single();
    
    if (profileError) throw profileError;
    
    // Get count of user's active services
    const { count, error: countError } = await supabase
      .from('services')
      .select('id', { count: 'exact', head: true })
      .eq('service_agent_id', userId)
      .eq('status', 'active');
    
    if (countError) throw countError;
    
    const currentCount = count || 0;
    const limit = profile.service_limit || 1;
    
    return {
      currentCount,
      limit,
      remainingSlots: Math.max(0, limit - currentCount),
      percentUsed: Math.min(100, Math.round((currentCount / limit) * 100)),
      planName: profile.subscription_plan || 'basic'
    };
  } catch (error) {
    console.error('Error getting service limit info:', error);
    throw error;
  }
}

export async function getUpgradeOptions(userId) {
  try {
    // Get user's current subscription
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_plan, user_type')
      .eq('id', userId)
      .single();
    
    if (profileError) throw profileError;
    
    // Define upgrade options based on user type and current plan
    const userType = profile.user_type;
    const currentPlan = profile.subscription_plan || 'basic';
    
    if (userType === 'service_agent') {
      // Service agent upgrade options
      if (currentPlan === 'basic') {
        return [
          {
            id: 'pro',
            name: 'Pro Contractor',
            price: '$75/month',
            serviceLimit: 20,
            features: [
              'Up to 20 Active Service Listings',
              'Priority Placement in Search Results',
              'Advanced Booking Management',
              'Client Messaging',
              'Payment Processing',
              'Analytics Dashboard'
            ]
          },
          {
            id: 'business',
            name: 'Business Contractor',
            price: '$150/month',
            serviceLimit: 50,
            features: [
              'Up to 50 Active Service Listings',
              'Top Placement in Search Results',
              'Team Management',
              'Advanced Reporting',
              'Custom Branding',
              'API Access',
              'Priority Support'
            ]
          }
        ];
      } else if (currentPlan === 'pro') {
        return [
          {
            id: 'business',
            name: 'Business Contractor',
            price: '$150/month',
            serviceLimit: 50,
            features: [
              'Up to 50 Active Service Listings',
              'Top Placement in Search Results',
              'Team Management',
              'Advanced Reporting',
              'Custom Branding',
              'API Access',
              'Priority Support'
            ]
          }
        ];
      } else {
        // Already on highest plan
        return [];
      }
    } else {
      // Client upgrade options
      if (currentPlan === 'basic') {
        return [
          {
            id: 'plus',
            name: 'FAIT Plus',
            price: '$9.99/month',
            features: [
              'Priority Booking',
              'Extended Warranties',
              'Discounted Service Fees',
              'Premium Support',
              'Service History Reports'
            ]
          },
          {
            id: 'family',
            name: 'Family Plan',
            price: '$19.99/month',
            features: [
              'Multiple Properties',
              'Family Account Sharing',
              'Maintenance Scheduling',
              'Emergency Service Priority',
              'Annual Home Assessment'
            ]
          }
        ];
      } else if (currentPlan === 'plus') {
        return [
          {
            id: 'family',
            name: 'Family Plan',
            price: '$19.99/month',
            features: [
              'Multiple Properties',
              'Family Account Sharing',
              'Maintenance Scheduling',
              'Emergency Service Priority',
              'Annual Home Assessment'
            ]
          }
        ];
      } else {
        // Already on highest plan
        return [];
      }
    }
  } catch (error) {
    console.error('Error getting upgrade options:', error);
    throw error;
  }
}
