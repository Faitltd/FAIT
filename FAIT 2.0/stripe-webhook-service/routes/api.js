const express = require('express');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Credit package price IDs in Stripe
const CREDIT_PACKAGES = {
  'credits-100': {
    priceId: 'price_1RKcrwBXhGFYU3zX5j2RCnyu',
    credits: 100
  },
  'credits-500': {
    priceId: 'price_1RKcrwBXhGFYU3zXdOYpHz2u',
    credits: 500
  },
  'credits-1000': {
    priceId: 'price_1RKcrxBXhGFYU3zX7UI9MO6a',
    credits: 1000
  }
};

// Rate limiting for checkout endpoint
const checkoutRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many checkout requests, please try again later" }
});

// Create checkout session endpoint
router.post('/create-checkout-session', checkoutRateLimiter, async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl, email } = req.body;

    // Validate request
    if (!priceId || !successUrl || !cancelUrl || !email) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Get credit package details
    const packageDetails = CREDIT_PACKAGES[priceId];
    if (!packageDetails) {
      return res.status(400).json({ error: 'Invalid price ID' });
    }

    // Find or create user by email
    let userId;

    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError && userError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error finding user:', userError);
      return res.status(500).json({ error: 'Error processing request' });
    }

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user with API key
      const { data: newUser, error: createError } = await supabase.rpc('create_user_with_api_key', {
        p_email: email,
        p_initial_credits: 0,
        p_role: 'user'
      });

      if (createError) {
        console.error('Error creating user:', createError);
        return res.status(500).json({ error: 'Error creating user account' });
      }

      userId = newUser.id;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: packageDetails.priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      metadata: {
        userId: userId,
        credits: packageDetails.credits.toString(),
        packageId: priceId
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Get user credits endpoint
router.get('/user-credits', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, credits, api_key')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return res.status(404).json({ error: 'User not found' });
      }
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: 'Error fetching user data' });
    }

    // Return user credits info (but not the full API key)
    res.json({
      id: user.id,
      email: user.email,
      credits: user.credits,
      apiKeyPrefix: user.api_key.substring(0, 8) + '...'
    });
  } catch (error) {
    console.error('Error fetching user credits:', error);
    res.status(500).json({ error: 'Failed to fetch user credits' });
  }
});

// Get credit packages endpoint
router.get('/credit-packages', (req, res) => {
  const packages = [
    {
      id: 'credits-100',
      name: '100 Credits',
      credits: 100,
      price: 9.99
    },
    {
      id: 'credits-500',
      name: '500 Credits',
      credits: 500,
      price: 39.99,
      popular: true,
      savings: '20%'
    },
    {
      id: 'credits-1000',
      name: '1000 Credits',
      credits: 1000,
      price: 69.99,
      savings: '30%'
    }
  ];

  res.json(packages);
});

module.exports = router;
