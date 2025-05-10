const express = require('express');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
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
    priceId: 'price_credits_100',
    credits: 100
  },
  'credits-500': {
    priceId: 'price_credits_500',
    credits: 500
  },
  'credits-1000': {
    priceId: 'price_credits_1000',
    credits: 1000
  }
};

// Rate limiting - simple in-memory implementation
// For production, use a more robust solution like Redis
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 requests per minute
  clients: new Map()
};

function rateLimit(req, res, next) {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  // Get client's request count
  const now = Date.now();
  const clientData = RATE_LIMIT.clients.get(clientIp) || { count: 0, resetTime: now + RATE_LIMIT.windowMs };
  
  // Reset count if window has passed
  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + RATE_LIMIT.windowMs;
  } else {
    clientData.count += 1;
  }
  
  RATE_LIMIT.clients.set(clientIp, clientData);
  
  // Check if rate limit exceeded
  if (clientData.count > RATE_LIMIT.maxRequests) {
    return res.status(429).json({
      error: 'Too many requests, please try again later',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
  }
  
  next();
}

// Create checkout session endpoint
router.post('/create-checkout-session', rateLimit, async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
    
    // Validate request
    if (!priceId || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Verify user authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
    
    // Get credit package details
    const packageDetails = CREDIT_PACKAGES[priceId];
    if (!packageDetails) {
      return res.status(400).json({ error: 'Invalid price ID' });
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
      customer_email: user.email,
      metadata: {
        userId: user.id,
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

module.exports = router;
