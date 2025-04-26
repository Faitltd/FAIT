#!/usr/bin/env node

/**
 * This script sets up the Stripe products and plans for the FAIT Cooperative Platform
 * 
 * Prerequisites:
 * - Node.js installed
 * - Stripe CLI installed
 * - Stripe API key set in environment variable STRIPE_SECRET_KEY
 * 
 * Usage:
 * export STRIPE_SECRET_KEY=sk_test_your_key
 * node scripts/setup_stripe_products.js
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Configuration for products and plans
const productsConfig = [
  {
    product: {
      name: 'Contractor Access',
      description: 'Access plans for contractors',
      type: 'service'
    },
    plans: [
      {
        nickname: 'Free Tier',
        amount: 0,
        currency: 'usd',
        interval: 'month'
      },
      {
        nickname: 'Pro Contractor',
        amount: 7500, // $75.00
        currency: 'usd',
        interval: 'month'
      },
      {
        nickname: 'Pro Contractor Annual',
        amount: 75000, // $750.00
        currency: 'usd',
        interval: 'year'
      },
      {
        nickname: 'Business Contractor',
        amount: 20000, // $200.00
        currency: 'usd',
        interval: 'month'
      },
      {
        nickname: 'Business Contractor Annual',
        amount: 200000, // $2,000.00
        currency: 'usd',
        interval: 'year'
      }
    ]
  },
  {
    product: {
      name: 'Homeowner Access',
      description: 'Homeowner basic and premium plans',
      type: 'service'
    },
    plans: [
      {
        nickname: 'Free Homeowner',
        amount: 0,
        currency: 'usd',
        interval: 'month'
      },
      {
        nickname: 'FAIT Plus',
        amount: 499, // $4.99
        currency: 'usd',
        interval: 'month'
      },
      {
        nickname: 'FAIT Plus Annual',
        amount: 4900, // $49.00
        currency: 'usd',
        interval: 'year'
      }
    ]
  },
  {
    product: {
      name: 'Co-op Membership',
      description: 'Annual membership for cooperative benefits',
      type: 'service'
    },
    plans: [
      {
        nickname: 'Annual Membership Fee',
        amount: 10000, // $100.00
        currency: 'usd',
        interval: 'year'
      }
    ]
  }
];

// Function to create products and plans
async function setupStripeProducts() {
  try {
    console.log('Setting up Stripe products and plans...');
    
    // Create each product and its plans
    for (const config of productsConfig) {
      // Create the product
      console.log(`Creating product: ${config.product.name}`);
      const product = await stripe.products.create({
        name: config.product.name,
        description: config.product.description,
        type: config.product.type
      });
      
      console.log(`Product created with ID: ${product.id}`);
      
      // Create plans for the product
      for (const planConfig of config.plans) {
        console.log(`Creating plan: ${planConfig.nickname}`);
        
        const price = await stripe.prices.create({
          product: product.id,
          nickname: planConfig.nickname,
          unit_amount: planConfig.amount,
          currency: planConfig.currency,
          recurring: {
            interval: planConfig.interval
          }
        });
        
        console.log(`Plan created with ID: ${price.id}`);
        
        // Store the price ID in environment variables
        const envVarName = `STRIPE_PRICE_${planConfig.nickname.replace(/\s+/g, '_').toUpperCase()}`;
        console.log(`Set this environment variable: ${envVarName}=${price.id}`);
      }
      
      console.log('---');
    }
    
    console.log('Stripe products and plans setup completed successfully!');
    console.log('Please set the environment variables listed above in your Supabase project.');
  } catch (error) {
    console.error('Error setting up Stripe products and plans:', error);
  }
}

// Run the setup
setupStripeProducts();
