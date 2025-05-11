#!/usr/bin/env node

/**
 * This script generates a Stripe webhook secret and adds it to the .env file
 *
 * Usage:
 * node scripts/generate_webhook_secret.js
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a secure random string for the webhook secret
function generateWebhookSecret() {
  // Generate 32 bytes of random data and convert to base64
  return 'whsec_' + crypto.randomBytes(32).toString('hex');
}

// Main function
async function main() {
  try {
    // Generate the webhook secret
    const webhookSecret = generateWebhookSecret();
    console.log('Generated webhook secret:', webhookSecret);

    // Path to .env file
    const envFilePath = path.resolve(path.dirname(__dirname), '.env');

    // Read the current .env file
    let envContent = '';
    try {
      envContent = fs.readFileSync(envFilePath, 'utf8');
    } catch (err) {
      console.error('Error reading .env file:', err);
      process.exit(1);
    }

    // Check if STRIPE_WEBHOOK_SECRET already exists
    if (envContent.includes('STRIPE_WEBHOOK_SECRET=')) {
      // Replace the existing value
      envContent = envContent.replace(
        /STRIPE_WEBHOOK_SECRET=.*/,
        `STRIPE_WEBHOOK_SECRET=${webhookSecret}`
      );
    } else {
      // Add the new value
      envContent += `\nSTRIPE_WEBHOOK_SECRET=${webhookSecret}`;
    }

    // Write the updated content back to the .env file
    fs.writeFileSync(envFilePath, envContent);

    console.log('Added STRIPE_WEBHOOK_SECRET to .env file');
    console.log('\nIMPORTANT: You need to configure this webhook secret in your Stripe dashboard:');
    console.log('1. Go to https://dashboard.stripe.com/webhooks');
    console.log('2. Add a new endpoint with URL: https://ydisdyadjupyswcpbxzu.supabase.co/functions/v1/stripe-webhook');
    console.log('3. Select these events:');
    console.log('   - checkout.session.completed');
    console.log('   - invoice.payment_succeeded');
    console.log('   - invoice.payment_failed');
    console.log('   - customer.subscription.updated');
    console.log('   - customer.subscription.deleted');
    console.log('4. Use this webhook secret:', webhookSecret);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
main();
