const express = require('express');
const webhookController = require('../controllers/webhookController');

const router = express.Router();

/**
 * @route POST /api/webhooks/stripe
 * @desc Handle Stripe webhook events
 * @access Public (but verified with Stripe signature)
 */
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.handleStripeWebhook
);

/**
 * @route POST /api/webhooks/supabase
 * @desc Handle Supabase webhook events
 * @access Public (but verified with secret)
 */
router.post(
  '/supabase',
  express.json(),
  webhookController.handleSupabaseWebhook
);

module.exports = router;
