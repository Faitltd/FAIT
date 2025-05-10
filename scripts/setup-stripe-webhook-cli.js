#!/usr/bin/env node

/**
 * This script helps set up a Stripe webhook using the Stripe API
 * 
 * Usage:
 * node scripts/setup-stripe-webhook-cli.js your-domain.com
 */

import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Main function
async function main() {
  try {
    // Check if domain argument is provided
    const domain = process.argv[2];
    if (!domain) {
      console.error('Error: Domain name is required.');
      console.error('Usage: node scripts/setup-stripe-webhook-cli.js your-domain.com');
      process.exit(1);
    }
    
    // Load environment variables from .env file
    const envFilePath = path.resolve(path.dirname(__dirname), '.env');
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    
    // Parse environment variables
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        envVars[match[1]] = match[2];
      }
    });
    
    // Get Stripe API keys and webhook secret
    const stripeSecretKey = envVars.STRIPE_SECRET_KEY;
    const stripeWebhookSecret = envVars.STRIPE_WEBHOOK_SECRET;
    
    if (!stripeSecretKey) {
      console.error('Error: STRIPE_SECRET_KEY not found in .env file');
      process.exit(1);
    }
    
    if (!stripeWebhookSecret) {
      console.error('Error: STRIPE_WEBHOOK_SECRET not found in .env file');
      process.exit(1);
    }
    
    console.log('Setting up Stripe webhook...');
    
    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey);
    
    // Define webhook URL
    const webhookUrl = `https://${domain}/api/stripe-webhook`;
    const supabaseWebhookUrl = 'https://ydisdyadjupyswcpbxzu.supabase.co/functions/v1/stripe-webhook';
    
    // Check if webhook already exists
    console.log('Checking for existing webhooks...');
    const webhooks = await stripe.webhookEndpoints.list();
    
    const existingWebhook = webhooks.data.find(webhook => 
      webhook.url === webhookUrl || webhook.url === supabaseWebhookUrl
    );
    
    if (existingWebhook) {
      console.log(`Webhook already exists for URL: ${existingWebhook.url}`);
      console.log('Do you want to update it? (y/n)');
      
      // Simple way to get user input in Node.js
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      
      process.stdin.on('data', async (data) => {
        const input = data.toString().trim().toLowerCase();
        
        if (input === 'y' || input === 'yes') {
          try {
            // Update the webhook
            const updatedWebhook = await stripe.webhookEndpoints.update(
              existingWebhook.id,
              {
                url: webhookUrl,
                enabled_events: [
                  'checkout.session.completed',
                  'invoice.payment_succeeded',
                  'invoice.payment_failed',
                  'customer.subscription.updated',
                  'customer.subscription.deleted'
                ]
              }
            );
            
            console.log('Webhook updated successfully!');
            console.log(`URL: ${updatedWebhook.url}`);
            console.log(`Events: ${updatedWebhook.enabled_events.join(', ')}`);
            console.log(`Status: ${updatedWebhook.status}`);
            
            console.log('\nIMPORTANT: Use this webhook secret in your application:');
            console.log(stripeWebhookSecret);
            
          } catch (error) {
            console.error('Error updating webhook:', error);
          }
        } else {
          console.log('Webhook update cancelled.');
        }
        
        process.exit(0);
      });
      
      return;
    }
    
    // Create a new webhook
    console.log(`Creating new webhook for URL: ${webhookUrl}`);
    
    try {
      const webhook = await stripe.webhookEndpoints.create({
        url: webhookUrl,
        enabled_events: [
          'checkout.session.completed',
          'invoice.payment_succeeded',
          'invoice.payment_failed',
          'customer.subscription.updated',
          'customer.subscription.deleted'
        ]
      });
      
      console.log('Webhook created successfully!');
      console.log(`URL: ${webhook.url}`);
      console.log(`Events: ${webhook.enabled_events.join(', ')}`);
      console.log(`Status: ${webhook.status}`);
      
      console.log('\nIMPORTANT: Use this webhook secret in your application:');
      console.log(stripeWebhookSecret);
      
      // Also create a webhook for Supabase Functions
      console.log(`\nCreating webhook for Supabase Functions: ${supabaseWebhookUrl}`);
      
      const supabaseWebhook = await stripe.webhookEndpoints.create({
        url: supabaseWebhookUrl,
        enabled_events: [
          'checkout.session.completed',
          'invoice.payment_succeeded',
          'invoice.payment_failed',
          'customer.subscription.updated',
          'customer.subscription.deleted'
        ]
      });
      
      console.log('Supabase webhook created successfully!');
      console.log(`URL: ${supabaseWebhook.url}`);
      console.log(`Events: ${supabaseWebhook.enabled_events.join(', ')}`);
      console.log(`Status: ${supabaseWebhook.status}`);
      
    } catch (error) {
      console.error('Error creating webhook:', error);
      
      if (error.code === 'url_invalid') {
        console.log('\nThe webhook URL is invalid. This could be because:');
        console.log('1. Your domain is not yet set up properly');
        console.log('2. Your domain does not have a valid SSL certificate');
        console.log('3. Your domain is not publicly accessible');
        console.log('\nPlease ensure your domain is properly set up and try again.');
        console.log('In the meantime, you can set up the webhook manually in the Stripe dashboard:');
        console.log('1. Go to https://dashboard.stripe.com/webhooks');
        console.log(`2. Add a new endpoint with URL: ${webhookUrl}`);
        console.log('3. Select these events:');
        console.log('   - checkout.session.completed');
        console.log('   - invoice.payment_succeeded');
        console.log('   - invoice.payment_failed');
        console.log('   - customer.subscription.updated');
        console.log('   - customer.subscription.deleted');
        console.log(`4. Use this webhook secret: ${stripeWebhookSecret}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
main();
