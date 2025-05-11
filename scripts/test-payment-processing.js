#!/usr/bin/env node

/**
 * This script tests the payment processing functionality with Stripe
 * 
 * Usage:
 * node scripts/test-payment-processing.js
 */

import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

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
    
    if (!stripeSecretKey) {
      console.error('Error: STRIPE_SECRET_KEY not found in .env file');
      process.exit(1);
    }
    
    console.log('Testing payment processing with Stripe...');
    
    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey);
    
    // List available products and prices
    console.log('\nAvailable products and prices:');
    const prices = await stripe.prices.list({ 
      expand: ['data.product'],
      active: true
    });
    
    if (prices.data.length === 0) {
      console.error('No prices found. Please run the setup-stripe-products.js script first.');
      process.exit(1);
    }
    
    // Display available prices
    prices.data.forEach((price, index) => {
      const product = price.product;
      const amount = price.unit_amount / 100;
      const currency = price.currency.toUpperCase();
      const interval = price.recurring ? price.recurring.interval : 'one-time';
      
      console.log(`${index + 1}. ${product.name} - ${price.nickname}: ${amount} ${currency} (${interval}) [${price.id}]`);
    });
    
    // Ask user to select a price
    const selection = await prompt('\nSelect a price to test (enter number): ');
    const selectedIndex = parseInt(selection) - 1;
    
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= prices.data.length) {
      console.error('Invalid selection');
      process.exit(1);
    }
    
    const selectedPrice = prices.data[selectedIndex];
    console.log(`\nSelected: ${selectedPrice.product.name} - ${selectedPrice.nickname}`);
    
    // Create a test customer
    console.log('\nCreating test customer...');
    const customer = await stripe.customers.create({
      email: 'test@example.com',
      name: 'Test Customer',
      metadata: {
        test: 'true'
      }
    });
    
    console.log(`Customer created: ${customer.id}`);
    
    // Create a payment method
    console.log('\nCreating test payment method...');
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: '4242424242424242', // Test card
        exp_month: 12,
        exp_year: new Date().getFullYear() + 1,
        cvc: '123',
      },
    });
    
    console.log(`Payment method created: ${paymentMethod.id}`);
    
    // Attach payment method to customer
    console.log('\nAttaching payment method to customer...');
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customer.id,
    });
    
    console.log('Payment method attached successfully');
    
    // Create a subscription or payment intent based on price type
    if (selectedPrice.recurring) {
      // Create a subscription
      console.log('\nCreating test subscription...');
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: selectedPrice.id }],
        default_payment_method: paymentMethod.id,
        expand: ['latest_invoice.payment_intent'],
      });
      
      console.log(`Subscription created: ${subscription.id}`);
      console.log(`Status: ${subscription.status}`);
      
      if (subscription.latest_invoice && subscription.latest_invoice.payment_intent) {
        const paymentIntent = subscription.latest_invoice.payment_intent;
        console.log(`Payment intent: ${paymentIntent.id}`);
        console.log(`Payment status: ${paymentIntent.status}`);
      }
      
      // Check if webhook received the event
      console.log('\nChecking if webhook received the event...');
      console.log('This may take a few seconds...');
      
      // Wait for 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // List recent events
      const events = await stripe.events.list({
        limit: 5,
        type: 'customer.subscription.created',
      });
      
      const subscriptionEvent = events.data.find(event => 
        event.data.object.id === subscription.id
      );
      
      if (subscriptionEvent) {
        console.log('Webhook event found!');
        console.log(`Event ID: ${subscriptionEvent.id}`);
        console.log(`Event type: ${subscriptionEvent.type}`);
        console.log(`Created at: ${new Date(subscriptionEvent.created * 1000).toLocaleString()}`);
      } else {
        console.log('No webhook event found. This could be because:');
        console.log('1. The webhook is not properly configured');
        console.log('2. The event has not been processed yet');
        console.log('3. The webhook endpoint is not accessible');
      }
      
      // Clean up
      console.log('\nCleaning up test data...');
      await stripe.subscriptions.del(subscription.id);
      console.log('Subscription deleted');
      
    } else {
      // Create a payment intent
      console.log('\nCreating test payment intent...');
      const paymentIntent = await stripe.paymentIntents.create({
        amount: selectedPrice.unit_amount,
        currency: selectedPrice.currency,
        customer: customer.id,
        payment_method: paymentMethod.id,
        confirm: true,
        metadata: {
          test: 'true',
          price_id: selectedPrice.id
        }
      });
      
      console.log(`Payment intent created: ${paymentIntent.id}`);
      console.log(`Status: ${paymentIntent.status}`);
      
      // Check if webhook received the event
      console.log('\nChecking if webhook received the event...');
      console.log('This may take a few seconds...');
      
      // Wait for 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // List recent events
      const events = await stripe.events.list({
        limit: 5,
        type: 'payment_intent.succeeded',
      });
      
      const paymentEvent = events.data.find(event => 
        event.data.object.id === paymentIntent.id
      );
      
      if (paymentEvent) {
        console.log('Webhook event found!');
        console.log(`Event ID: ${paymentEvent.id}`);
        console.log(`Event type: ${paymentEvent.type}`);
        console.log(`Created at: ${new Date(paymentEvent.created * 1000).toLocaleString()}`);
      } else {
        console.log('No webhook event found. This could be because:');
        console.log('1. The webhook is not properly configured');
        console.log('2. The event has not been processed yet');
        console.log('3. The webhook endpoint is not accessible');
      }
    }
    
    // Clean up customer
    console.log('\nDeleting test customer...');
    await stripe.customers.del(customer.id);
    console.log('Customer deleted');
    
    console.log('\nPayment processing test completed successfully!');
    
  } catch (error) {
    console.error('Error testing payment processing:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
main();
