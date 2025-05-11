#!/usr/bin/env node

/**
 * This script tests the Stripe integration
 * 
 * Usage:
 * node scripts/test-stripe.js
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
    
    // Get Stripe API keys
    const stripeSecretKey = envVars.STRIPE_SECRET_KEY;
    const stripePublicKey = envVars.VITE_STRIPE_PUBLIC_KEY;
    const stripeWebhookSecret = envVars.STRIPE_WEBHOOK_SECRET;
    
    if (!stripeSecretKey || !stripePublicKey) {
      console.error('Error: Stripe API keys not found in .env file');
      process.exit(1);
    }
    
    console.log('Testing Stripe integration...');
    console.log(`Public Key: ${stripePublicKey.substring(0, 8)}...`);
    console.log(`Webhook Secret: ${stripeWebhookSecret ? 'Configured' : 'Not configured'}`);
    
    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey);
    
    // Test connection by retrieving account info
    console.log('\nTesting connection to Stripe API...');
    const account = await stripe.account.retrieve();
    console.log(`Connected to Stripe account: ${account.id}`);
    
    // List products
    console.log('\nListing products...');
    const products = await stripe.products.list({ limit: 10 });
    
    if (products.data.length === 0) {
      console.log('No products found. You may need to run the setup-stripe-products.js script.');
    } else {
      console.log(`Found ${products.data.length} products:`);
      products.data.forEach(product => {
        console.log(`- ${product.name} (${product.id})`);
      });
    }
    
    // List prices
    console.log('\nListing prices...');
    const prices = await stripe.prices.list({ limit: 20 });
    
    if (prices.data.length === 0) {
      console.log('No prices found. You may need to run the setup-stripe-products.js script.');
    } else {
      console.log(`Found ${prices.data.length} prices:`);
      prices.data.forEach(price => {
        const amount = price.unit_amount / 100;
        const currency = price.currency.toUpperCase();
        const interval = price.recurring ? price.recurring.interval : 'one-time';
        console.log(`- ${price.nickname || 'Unnamed price'}: ${amount} ${currency} (${interval}) [${price.id}]`);
      });
    }
    
    // List webhooks
    console.log('\nListing webhook endpoints...');
    const webhookEndpoints = await stripe.webhookEndpoints.list();
    
    if (webhookEndpoints.data.length === 0) {
      console.log('No webhook endpoints found. You need to create a webhook endpoint in the Stripe dashboard.');
    } else {
      console.log(`Found ${webhookEndpoints.data.length} webhook endpoints:`);
      webhookEndpoints.data.forEach(endpoint => {
        console.log(`- URL: ${endpoint.url}`);
        console.log(`  Events: ${endpoint.enabled_events.join(', ')}`);
        console.log(`  Status: ${endpoint.status}`);
      });
    }
    
    console.log('\nStripe integration test completed successfully!');
    
  } catch (error) {
    console.error('Error testing Stripe integration:', error);
    process.exit(1);
  }
}

// Run the script
main();
