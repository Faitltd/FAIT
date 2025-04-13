import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { createHmac } from 'node:crypto';
import * as crypto from 'node:crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Checkr-Signature',
};

const CHECKR_WEBHOOK_SECRET = Deno.env.get('CHECKR_WEBHOOK_SECRET');

// Verify Checkr webhook signature
const verifySignature = (payload: string, signature: string): boolean => {
  if (!CHECKR_WEBHOOK_SECRET) return false;
  
  const hmac = createHmac('sha256', CHECKR_WEBHOOK_SECRET);
  hmac.update(payload);
  const calculatedSignature = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(calculatedSignature, 'hex')
  );
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('X-Checkr-Signature');
    if (!signature) {
      throw new Error('Missing signature');
    }

    const payload = await req.text();
    if (!verifySignature(payload, signature)) {
      throw new Error('Invalid signature');
    }

    const event = JSON.parse(payload);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (event.type === 'report.completed') {
      const { report } = event.data;
      
      const { data: verification, error: findError } = await supabase
        .from('contractor_verifications')
        .select('*')
        .eq('checkr_report_id', report.id)
        .single();

      if (findError || !verification) {
        throw new Error('Verification record not found');
      }

      let status: string;
      let isVerified = false;

      switch (report.status) {
        case 'clear':
          status = 'clear';
          isVerified = true;
          break;
        case 'consider':
          status = 'consider';
          break;
        case 'suspended':
          status = 'suspended';
          break;
        case 'dispute':
          status = 'dispute';
          break;
        default:
          status = 'failed';
      }

      const { error: updateError } = await supabase
        .from('contractor_verifications')
        .update({
          background_check_status: status,
          is_verified: isVerified,
          updated_at: new Date().toISOString(),
        })
        .eq('id', verification.id);

      if (updateError) {
        throw updateError;
      }
    }

    return new Response(
      JSON.stringify({ message: 'Webhook processed successfully' }),
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
