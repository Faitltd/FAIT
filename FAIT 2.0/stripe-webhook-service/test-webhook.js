const Stripe = require('stripe');
require('dotenv').config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create a test checkout session
async function createTestCheckoutSession() {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'API Credits',
              description: '500 API credits for FAIT 2.0 platform',
            },
            unit_amount: 1000, // $10.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://faitcoop.org/success',
      cancel_url: 'https://faitcoop.org/cancel',
      customer_email: 'user@example.com', // This should match a user in your system
    });

    console.log('Test checkout session created:');
    console.log(`Session ID: ${session.id}`);
    console.log(`URL: ${session.url}`);
    
    // Simulate a webhook event
    console.log('\nSimulating webhook event...');
    const event = {
      id: 'evt_test_webhook',
      type: 'checkout.session.completed',
      data: {
        object: session
      }
    };
    
    console.log('Webhook event payload:');
    console.log(JSON.stringify(event, null, 2));
    
    console.log('\nTo test this with your local server:');
    console.log('1. Make sure your server is running');
    console.log('2. Use the Stripe CLI to forward events:');
    console.log('   stripe listen --forward-to http://localhost:8080/webhook/stripe');
    console.log('3. In another terminal, trigger the test event:');
    console.log(`   stripe trigger checkout.session.completed --add checkout_session:customer_email=user@example.com`);
    
  } catch (error) {
    console.error('Error creating test checkout session:', error);
  }
}

createTestCheckoutSession();
