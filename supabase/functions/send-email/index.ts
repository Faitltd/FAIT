import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { Resend } from 'npm:resend@1.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) throw new Error('Invalid token');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || (profile.user_type !== 'admin' && req.headers.get('X-System-Key') !== Deno.env.get('SYSTEM_API_KEY'))) {
      throw new Error('Unauthorized');
    }

    const { to, subject, html, text } = await req.json();
    
    const { data, error } = await resend.emails.send({
      from: 'noreply@fait-coop.com',
      to,
      subject,
      html,
      text
    });
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ data }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
