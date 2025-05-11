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
    const { supplierName, orderTotal, commissionRate } = await req.json();

    // Validate inputs
    if (!supplierName) throw new Error('Supplier name is required');
    if (!orderTotal || isNaN(orderTotal)) throw new Error('Valid order total is required');
    if (!commissionRate || isNaN(commissionRate)) throw new Error('Valid commission rate is required');

    // Calculate commission earned
    const commissionEarned = (orderTotal * commissionRate) / 100;

    // Record supplier order
    const { data: orderData, error: orderError } = await supabase
      .from('supplier_orders')
      .insert({
        user_id: user.id,
        supplier_name: supplierName,
        order_total: orderTotal,
        commission_rate: commissionRate,
        commission_earned: commissionEarned
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Record commission transaction
    const { error: commissionError } = await supabase
      .from('commission_transactions')
      .insert({
        supplier_order_id: orderData.id,
        service_agent_id: user.id,
        commission_amount: commissionEarned,
        paid_out: false
      });

    if (commissionError) throw commissionError;

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: 'Commission Earned',
        message: `You earned $${commissionEarned.toFixed(2)} commission from your ${supplierName} order.`,
        type: 'payment',
        is_read: false
      });

    return new Response(
      JSON.stringify({
        success: true,
        order: orderData,
        commissionEarned
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error(`Error recording supplier order: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
