// Supabase Edge Function for handling Telnyx SMS webhooks
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get webhook data
    const webhookData = await req.json()
    
    // Verify webhook signature if needed
    // const signature = req.headers.get('telnyx-signature-ed25519')
    // const timestamp = req.headers.get('telnyx-timestamp')
    // TODO: Implement signature verification
    
    // Process only message.received events
    const payload = webhookData.data?.payload
    if (!payload || payload.event_type !== 'message.received') {
      return new Response(JSON.stringify({ success: true, message: 'Ignored non-message event' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }
    
    const message = payload.payload
    const fromNumber = message.from.phone_number
    const toNumber = message.to[0].phone_number
    const text = message.text
    const mediaUrls = message.media?.map((m) => m.url) || []
    
    // Find the user this message is for
    const { data: conversation, error: convError } = await supabase
      .from('sms_conversations')
      .select('user_id')
      .eq('phone_number', fromNumber)
      .order('last_message_at', { ascending: false })
      .limit(1)
      .single()
    
    if (convError) {
      console.error('Could not determine user for incoming SMS:', fromNumber)
      // If no conversation exists, we might want to create one for a default user or admin
      // For now, we'll just acknowledge the webhook
      return new Response(JSON.stringify({ success: true, message: 'No matching conversation found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }
    
    // Store the message in the database
    const { error: msgError } = await supabase
      .from('sms_messages')
      .insert({
        external_id: message.id,
        user_id: conversation.user_id,
        direction: 'inbound',
        from_number: fromNumber,
        to_number: toNumber,
        message_text: text,
        status: 'delivered',
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        delivered_at: new Date().toISOString(),
      })
    
    if (msgError) {
      console.error('Error storing incoming SMS:', msgError)
      return new Response(JSON.stringify({ success: false, error: 'Database error' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }
    
    // Optional: Send a notification to the user
    // This could be implemented using Supabase realtime or a separate notification system
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
