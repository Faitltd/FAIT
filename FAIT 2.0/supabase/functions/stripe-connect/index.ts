import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import Stripe from 'npm:stripe@12.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Initialize Stripe with the MASTER API key for platform operations
// This key has more permissions than the regular secret key
const stripe = new Stripe(Deno.env.get('STRIPE_MASTER_API_KEY') || '');

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authenticate user - only admins should be able to use this endpoint
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) throw new Error('Invalid token');

    // Check if user is an admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;
    if (profile.user_role !== 'admin') throw new Error('Unauthorized: Admin access required');

    // Parse request body
    const { action, userId, ...params } = await req.json();

    // Handle different actions
    switch (action) {
      case 'create_connect_account':
        return await handleCreateConnectAccount(supabase, userId, params);
      case 'create_account_link':
        return await handleCreateAccountLink(supabase, userId, params);
      case 'get_account_balance':
        return await handleGetAccountBalance(supabase, userId);
      case 'create_payout':
        return await handleCreatePayout(supabase, userId, params);
      case 'get_account_details':
        return await handleGetAccountDetails(supabase, userId);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error(`Error in stripe-connect function: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});

/**
 * Create a Stripe Connect account for a contractor
 */
async function handleCreateConnectAccount(supabase, userId, params) {
  const { country, email, business_type = 'individual' } = params;

  if (!userId || !country || !email) {
    throw new Error('Missing required parameters: userId, country, and email are required');
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) throw profileError;

  // Check if user already has a Stripe Connect account
  if (profile.stripe_connect_id) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'User already has a Stripe Connect account',
        accountId: profile.stripe_connect_id
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // Create a Stripe Connect account
  const account = await stripe.accounts.create({
    type: 'express',
    country,
    email,
    business_type,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      user_id: userId,
      platform: 'FAIT Co-op'
    }
  });

  // Update user profile with Stripe Connect account ID
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      stripe_connect_id: account.id,
      stripe_connect_status: account.details_submitted ? 'complete' : 'pending'
    })
    .eq('id', userId);

  if (updateError) throw updateError;

  return new Response(
    JSON.stringify({ 
      success: true, 
      accountId: account.id,
      detailsSubmitted: account.details_submitted
    }),
    { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  );
}

/**
 * Create an account link for onboarding or updating a Stripe Connect account
 */
async function handleCreateAccountLink(supabase, userId, params) {
  const { return_url, refresh_url, type = 'account_onboarding' } = params;

  if (!userId || !return_url || !refresh_url) {
    throw new Error('Missing required parameters: userId, return_url, and refresh_url are required');
  }

  // Get user profile to get Stripe Connect account ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_connect_id')
    .eq('id', userId)
    .single();

  if (profileError) throw profileError;
  if (!profile.stripe_connect_id) {
    throw new Error('User does not have a Stripe Connect account');
  }

  // Create an account link
  const accountLink = await stripe.accountLinks.create({
    account: profile.stripe_connect_id,
    refresh_url,
    return_url,
    type,
    collect: 'currently_due'
  });

  return new Response(
    JSON.stringify({ 
      success: true, 
      url: accountLink.url
    }),
    { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  );
}

/**
 * Get the balance for a Stripe Connect account
 */
async function handleGetAccountBalance(supabase, userId) {
  // Get user profile to get Stripe Connect account ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_connect_id')
    .eq('id', userId)
    .single();

  if (profileError) throw profileError;
  if (!profile.stripe_connect_id) {
    throw new Error('User does not have a Stripe Connect account');
  }

  // Get account balance
  const balance = await stripe.balance.retrieve({
    stripeAccount: profile.stripe_connect_id
  });

  return new Response(
    JSON.stringify({ 
      success: true, 
      balance
    }),
    { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  );
}

/**
 * Create a payout for a Stripe Connect account
 */
async function handleCreatePayout(supabase, userId, params) {
  const { amount, currency = 'usd' } = params;

  if (!userId || !amount) {
    throw new Error('Missing required parameters: userId and amount are required');
  }

  // Get user profile to get Stripe Connect account ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_connect_id')
    .eq('id', userId)
    .single();

  if (profileError) throw profileError;
  if (!profile.stripe_connect_id) {
    throw new Error('User does not have a Stripe Connect account');
  }

  // Create a payout
  const payout = await stripe.payouts.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    metadata: {
      user_id: userId
    }
  }, {
    stripeAccount: profile.stripe_connect_id
  });

  // Record the payout in the database
  const { error: payoutError } = await supabase
    .from('payouts')
    .insert({
      user_id: userId,
      stripe_payout_id: payout.id,
      amount: amount,
      currency: currency,
      status: payout.status,
      arrival_date: new Date(payout.arrival_date * 1000).toISOString()
    });

  if (payoutError) throw payoutError;

  return new Response(
    JSON.stringify({ 
      success: true, 
      payout
    }),
    { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  );
}

/**
 * Get details for a Stripe Connect account
 */
async function handleGetAccountDetails(supabase, userId) {
  // Get user profile to get Stripe Connect account ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_connect_id')
    .eq('id', userId)
    .single();

  if (profileError) throw profileError;
  if (!profile.stripe_connect_id) {
    throw new Error('User does not have a Stripe Connect account');
  }

  // Get account details
  const account = await stripe.accounts.retrieve(profile.stripe_connect_id);

  return new Response(
    JSON.stringify({ 
      success: true, 
      account
    }),
    { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  );
}
