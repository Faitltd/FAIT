// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get("SUPABASE_URL") ?? "",
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );
    
    // Check for API key in request headers
    const apiKey = req.headers.get("x-api-key");
    const expectedApiKey = Deno.env.get("SCHEDULED_TASKS_API_KEY");
    
    if (!apiKey || apiKey !== expectedApiKey) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }
    
    // Send verification expiration reminders
    const { data: verifications, error: verificationError } = await supabaseClient
      .from("service_agent_verification")
      .select(`
        *,
        profiles:service_agent_id(id, full_name, email, phone, business_name)
      `)
      .eq("verification_status", "approved")
      .eq("is_verified", true);
      
    if (verificationError) {
      throw verificationError;
    }
    
    const now = new Date();
    const remindersSent = {
      "30_days": 0,
      "7_days": 0,
      "1_day": 0,
      "total": 0
    };
    
    // Process each verification
    for (const verification of verifications || []) {
      if (!verification.expiration_date || !verification.profiles?.email) {
        continue;
      }
      
      const expirationDate = new Date(verification.expiration_date);
      const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Send reminders for specific thresholds
      if (daysRemaining === 30 || daysRemaining === 7 || daysRemaining === 1) {
        // Send email notification
        const { error: emailError } = await supabaseClient.functions.invoke("send-email", {
          body: {
            to: verification.profiles.email,
            subject: `Your Verification Will Expire in ${daysRemaining} Days`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #333;">Verification Expiration Reminder</h2>
                <p>Hello ${verification.profiles.full_name || 'there'},</p>
                <p>This is a reminder that your verification will expire in <strong>${daysRemaining} days</strong> (on ${expirationDate.toLocaleDateString()}).</p>
                <p>To maintain your verified status, please log into your account and renew your verification before it expires.</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p>Thank you for being part of FAIT Co-op!</p>
                </div>
              </div>
            `,
            text: `Verification Expiration Reminder\n\nHello ${verification.profiles.full_name || 'there'},\n\nThis is a reminder that your verification will expire in ${daysRemaining} days (on ${expirationDate.toLocaleDateString()}).\n\nTo maintain your verified status, please log into your account and renew your verification before it expires.\n\nThank you for being part of FAIT Co-op!`
          }
        });
        
        if (!emailError) {
          // Log the reminder in verification history
          await supabaseClient
            .from("verification_history")
            .insert({
              verification_id: verification.id,
              action: "expiration_reminder",
              previous_status: verification.verification_status,
              new_status: verification.verification_status,
              notes: `Expiration reminder sent (${daysRemaining} days remaining)`
            });
          
          // Increment counter
          if (daysRemaining === 30) remindersSent["30_days"]++;
          if (daysRemaining === 7) remindersSent["7_days"]++;
          if (daysRemaining === 1) remindersSent["1_day"]++;
          remindersSent["total"]++;
        }
      }
    }
    
    // Check for expired verifications
    const { data: expiredVerifications, error: expiredError } = await supabaseClient
      .from("service_agent_verification")
      .select(`
        *,
        profiles:service_agent_id(id, full_name, email, phone, business_name)
      `)
      .eq("verification_status", "approved")
      .eq("is_verified", true)
      .lt("expiration_date", now.toISOString());
      
    if (expiredError) {
      throw expiredError;
    }
    
    let expiredCount = 0;
    
    // Process expired verifications
    for (const verification of expiredVerifications || []) {
      // Update verification status
      const { error: updateError } = await supabaseClient
        .from("service_agent_verification")
        .update({
          verification_status: "expired",
          is_verified: false,
          updated_at: now.toISOString()
        })
        .eq("id", verification.id);
        
      if (updateError) {
        console.error("Error updating expired verification:", updateError);
        continue;
      }
      
      // Add to verification history
      await supabaseClient
        .from("verification_history")
        .insert({
          verification_id: verification.id,
          action: "expired",
          previous_status: "approved",
          new_status: "expired",
          notes: "Verification expired automatically"
        });
      
      // Send email notification if email exists
      if (verification.profiles?.email) {
        await supabaseClient.functions.invoke("send-email", {
          body: {
            to: verification.profiles.email,
            subject: "Your Verification Has Expired",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #333;">Verification Expired</h2>
                <p>Hello ${verification.profiles.full_name || 'there'},</p>
                <p>Your verification has expired. To continue using all features of the FAIT Co-op platform, please renew your verification.</p>
                <p>Log into your account and visit the verification page to start the renewal process.</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p>We look forward to continuing our partnership.</p>
                </div>
              </div>
            `,
            text: `Verification Expired\n\nHello ${verification.profiles.full_name || 'there'},\n\nYour verification has expired. To continue using all features of the FAIT Co-op platform, please renew your verification.\n\nLog into your account and visit the verification page to start the renewal process.\n\nWe look forward to continuing our partnership.`
          }
        });
      }
      
      expiredCount++;
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        remindersSent,
        expiredCount
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/run-scheduled-tasks' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --header 'x-api-key: your-api-key-here' \
//   --data '{"name":"Functions"}'
