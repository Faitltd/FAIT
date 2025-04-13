import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, estimate } = await req.json();

    // Basic validation
    if (!email || !estimate) {
      throw new Error('Missing required fields');
    }

    // Initialize email service (example using a mock service)
    const emailContent = `
      <h2>Your FAIT Co-Op Project Estimate</h2>
      <p>Thank you for using our cost calculator. Here's your estimate breakdown:</p>
      
      <h3>Project Details:</h3>
      ${estimate.selections.map((selection: any) => `
        <div style="margin-bottom: 20px;">
          <h4>${selection.room || selection.task}</h4>
          <p>Quality Level: ${selection.quality || 'N/A'}</p>
          <p>Square Footage: ${selection.sqft || selection.quantity} ${selection.unit || 'sq ft'}</p>
          <p>Cost: $${Math.round(selection.cost || 0).toLocaleString()}</p>
        </div>
      `).join('')}
      
      <h3>Cost Breakdown:</h3>
      <p>Labor: $${Math.round(estimate.costs.labor || 0).toLocaleString()}</p>
      <p>Materials: $${Math.round(estimate.costs.material || 0).toLocaleString()}</p>
      <p>Project Management (5%): $${Math.round(estimate.costs.projectManagement || 0).toLocaleString()}</p>
      <p><strong>Total Estimate: $${Math.round(estimate.costs.total || 0).toLocaleString()}</strong></p>
      
      <p>Note: This is a rough estimate based on average costs. Actual prices may vary based on specific requirements and contractor availability.</p>
      
      <p>Ready to get started? <a href="${Deno.env.get('SITE_URL')}/register">Create an account</a> to connect with verified contractors in your area.</p>
    `;

    // In a real implementation, you would use a proper email service
    console.log('Sending email to:', email);
    console.log('Email content:', emailContent);

    return new Response(
      JSON.stringify({ message: 'Estimate sent successfully' }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});