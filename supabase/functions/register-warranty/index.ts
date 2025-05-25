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
    const { projectId, homeownerId, contractorId, warrantyType } = await req.json();

    // Validate inputs
    if (!projectId) throw new Error('Project ID is required');
    if (!homeownerId) throw new Error('Homeowner ID is required');
    if (!contractorId) throw new Error('Contractor ID is required');
    if (!warrantyType || !['1yr', '2yr', '3yr-extended'].includes(warrantyType)) {
      throw new Error('Valid warranty type is required (1yr, 2yr, or 3yr-extended)');
    }

    // Calculate warranty duration in years
    let durationYears = 1;
    if (warrantyType === '2yr') durationYears = 2;
    if (warrantyType === '3yr-extended') durationYears = 3;

    // Calculate start and end dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + durationYears);

    // Check if homeowner has FAIT Plus subscription for potential extension
    // This is handled by the database trigger, but we'll check here for the response message
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('plan_name, active, end_date')
      .eq('user_id', homeownerId)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const hasFaitPlus = subscriptionData && 
                        subscriptionData.plan_name === 'FAIT Plus' && 
                        subscriptionData.active && 
                        (!subscriptionData.end_date || new Date(subscriptionData.end_date) >= new Date());

    // Register warranty
    const { data: warrantyData, error: warrantyError } = await supabase
      .from('warranties')
      .insert({
        project_id: projectId,
        homeowner_id: homeownerId,
        contractor_id: contractorId,
        warranty_type: warrantyType,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      })
      .select()
      .single();

    if (warrantyError) throw warrantyError;

    // Create notifications for both homeowner and contractor
    await supabase
      .from('notifications')
      .insert([
        {
          user_id: homeownerId,
          title: 'Warranty Registered',
          message: `Your ${warrantyData.warranty_type} warranty has been registered successfully.`,
          type: 'system',
          is_read: false
        },
        {
          user_id: contractorId,
          title: 'Warranty Registered',
          message: `A ${warrantyData.warranty_type} warranty has been registered for project ${projectId}.`,
          type: 'system',
          is_read: false
        }
      ]);

    // Prepare response message
    let responseMessage = `${warrantyData.warranty_type} warranty registered successfully.`;
    
    // If homeowner has FAIT Plus and warranty was extended, add that to the message
    if (hasFaitPlus && warrantyData.warranty_type !== warrantyType) {
      responseMessage += ` Warranty was automatically extended to ${warrantyData.warranty_type} because the homeowner has a FAIT Plus subscription.`;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        warranty: warrantyData,
        message: responseMessage
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error(`Error registering warranty: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
