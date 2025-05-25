import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) throw new Error('Invalid token');

    // Get request data
    const { featureKey } = await req.json();

    // Validate inputs
    if (!featureKey) throw new Error('Feature key is required');

    // Get user profile to determine user type
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    // Get user's active subscription
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('plan_name, active, end_date')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // If no subscription found, check if feature is available in free tier
    if (subscriptionError || !subscriptionData) {
      // Check if feature is available in free tier
      const { data: featureData, error: featureError } = await supabase
        .from('subscription_features')
        .select('feature_value')
        .eq('plan_name', profileData.user_type === 'contractor' || profileData.user_type === 'service_agent' ? 'Free Tier' : 'Free Homeowner')
        .eq('user_type', profileData.user_type)
        .eq('feature_key', featureKey)
        .single();

      if (featureError || !featureData) {
        return new Response(
          JSON.stringify({ 
            hasAccess: false,
            message: 'Feature not available in free tier'
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ 
          hasAccess: featureData.feature_value.enabled === true,
          featureValue: featureData.feature_value,
          planName: profileData.user_type === 'contractor' || profileData.user_type === 'service_agent' ? 'Free Tier' : 'Free Homeowner'
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if subscription is active and not expired
    const isActive = subscriptionData.active && 
      (!subscriptionData.end_date || new Date(subscriptionData.end_date) >= new Date());

    if (!isActive) {
      return new Response(
        JSON.stringify({ 
          hasAccess: false,
          message: 'Subscription is not active'
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if feature is available in the subscription plan
    const { data: featureData, error: featureError } = await supabase
      .from('subscription_features')
      .select('feature_value')
      .eq('plan_name', subscriptionData.plan_name)
      .eq('user_type', profileData.user_type)
      .eq('feature_key', featureKey)
      .single();

    if (featureError || !featureData) {
      return new Response(
        JSON.stringify({ 
          hasAccess: false,
          message: 'Feature not available in subscription plan'
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ 
        hasAccess: featureData.feature_value.enabled === true,
        featureValue: featureData.feature_value,
        planName: subscriptionData.plan_name
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error(`Error checking feature access: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
