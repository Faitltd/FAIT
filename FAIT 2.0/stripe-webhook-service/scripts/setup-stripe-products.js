#!/usr/bin/env node

/**
 * This script sets up the Stripe products and prices for the credits system.
 * Run this script once to initialize your Stripe account with the necessary products.
 */

const Stripe = require('stripe');
require('dotenv').config();

// Initialize Stripe with your secret key
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Credit packages configuration
const CREDIT_PACKAGES = [
  {
    name: '100 Credits',
    description: 'Purchase 100 credits for API access',
    price: 9.99,
    credits: 100,
    priceId: 'credits-100'
  },
  {
    name: '500 Credits',
    description: 'Purchase 500 credits for API access (20% savings)',
    price: 39.99,
    credits: 500,
    priceId: 'credits-500'
  },
  {
    name: '1000 Credits',
    description: 'Purchase 1000 credits for API access (30% savings)',
    price: 69.99,
    credits: 1000,
    priceId: 'credits-1000'
  }
];

async function createProduct() {
  try {
    console.log('Creating Credits product in Stripe...');
    
    // Create the main Credits product
    const product = await stripe.products.create({
      name: 'FAIT Platform Credits',
      description: 'Credits for API access and advanced features',
      metadata: {
        type: 'credits'
      }
    });
    
    console.log(`✅ Created product: ${product.name} (${product.id})`);
    
    // Create prices for each credit package
    for (const pkg of CREDIT_PACKAGES) {
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(pkg.price * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          credits: pkg.credits.toString(),
          priceId: pkg.priceId
        },
        nickname: pkg.name,
        lookup_key: pkg.priceId
      });
      
      console.log(`✅ Created price: ${pkg.name} - $${pkg.price} (${price.id})`);
    }
    
    console.log('\nSetup complete! Use these price IDs in your application:');
    console.log('-------------------------------------------------------');
    console.log('Update the CREDIT_PACKAGES object in api/create-checkout-session.js with these values:');
    console.log(`
const CREDIT_PACKAGES = {
  'credits-100': {
    priceId: '${pkg.priceId}',
    credits: 100
  },
  'credits-500': {
    priceId: '${pkg.priceId}',
    credits: 500
  },
  'credits-1000': {
    priceId: '${pkg.priceId}',
    credits: 1000
  }
};
    `);
    
  } catch (error) {
    console.error('❌ Error creating Stripe products:', error);
  }
}

// Run the script
createProduct();
