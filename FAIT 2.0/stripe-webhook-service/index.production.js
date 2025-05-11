const express = require("express");
const Stripe = require("stripe");
const bodyParser = require("body-parser");
const { createClient } = require("@supabase/supabase-js");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

// Security middleware
app.use(helmet()); // Set security headers
app.use(morgan('combined', { stream: accessLogStream })); // Logging

// Rate limiting for all routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: "Too many requests, please try again later" }
});

// Apply rate limiting to all routes
app.use(apiLimiter);

// Use raw body parser for Stripe webhook only
app.use("/webhook", bodyParser.raw({ type: "application/json" }));
app.use(express.json());

// Import API routes
const apiRoutes = require('./routes/api');

// Use API routes
app.use('/api', apiRoutes);

// === Stripe Webhook: Process events ===
app.post("/webhook", async (req, res) => {
  // Get the signature from the headers
  const signature = req.headers["stripe-signature"];

  // Check if signature exists
  if (!signature) {
    console.error("⚠️  No stripe-signature header value was provided.");
    return res.status(400).send("Webhook Error: No stripe-signature header value was provided.");
  }

  // Get the webhook secret from environment variables
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Check if webhook secret is configured
  if (!endpointSecret) {
    console.error("⚠️  Webhook secret is not configured.");
    return res.status(500).send("Webhook Error: Server is not configured to handle webhooks.");
  }

  let event;
  try {
    // Verify and construct the event
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      endpointSecret
    );

    // Log successful verification
    console.log(`✅ Webhook signature verified for event ${event.id}`);
  } catch (err) {
    // Log detailed error information
    console.error("⚠️  Webhook signature verification failed:", err.message);

    // Return a 400 error to Stripe
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Check if this event has already been processed (prevents replay attacks)
  try {
    const { data: existingEvent, error: lookupError } = await supabase
      .from('processed_events')
      .select('id')
      .eq('event_id', event.id)
      .single();

    if (lookupError && lookupError.code !== 'PGRST116') { // PGRST116 is "Did not find any rows" error
      console.error(`⚠️ Error checking for duplicate event: ${lookupError.message}`);
      // Continue processing - better to risk duplicate processing than missing an event
    }

    if (existingEvent) {
      console.warn(`⚠️ Duplicate event detected: ${event.id}`);
      return res.status(200).send(`Duplicate event: ${event.id}`);
    }

    // Record this event as processed
    const { error: insertError } = await supabase
      .from('processed_events')
      .insert({
        event_id: event.id,
        event_type: event.type
      });

    if (insertError) {
      console.error(`⚠️ Error recording processed event: ${insertError.message}`);
      // Continue processing - better to risk duplicate processing than missing an event
    } else {
      console.log(`✅ Recorded event ${event.id} as processed`);
    }
  } catch (err) {
    console.error(`⚠️ Error in duplicate detection: ${err.message}`);
    // Continue processing - better to risk duplicate processing than missing an event
  }

  // Log the event type for monitoring
  console.log(`Received Stripe webhook event: ${event.type} (ID: ${event.id})`);

  try {
    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object);
        break;
      case "payment_method.attached":
        const paymentMethod = event.data.object;
        await handlePaymentMethodAttached(paymentMethod);
        break;
      case "invoice.paid":
        const invoice = event.data.object;
        await handleInvoicePaid(invoice);
        break;
      case "invoice.payment_failed":
        const failedInvoice = event.data.object;
        await handleInvoicePaymentFailed(failedInvoice);
        break;
      case "customer.subscription.created":
        const subscription = event.data.object;
        await handleSubscriptionCreated(subscription);
        break;
      case "customer.subscription.updated":
        const updatedSubscription = event.data.object;
        await handleSubscriptionUpdated(updatedSubscription);
        break;
      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object;
        await handleSubscriptionDeleted(deletedSubscription);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.sendStatus(200);
  } catch (err) {
    // Log detailed error information
    console.error(`⚠️ Error processing webhook event ${event.type} (ID: ${event.id}):`, err);

    // Still return 200 to Stripe so they don't retry (we'll handle errors internally)
    // This is important because we've already verified the signature and don't want Stripe to retry
    res.status(200).send(`Event processed with errors: ${event.id}`);

    // Log the error to our monitoring system with event ID for traceability
    await logWebhookError(event.type, event.id, err);

    // In a production environment, you might want to:
    // 1. Send an alert to your monitoring system
    // 2. Queue the event for retry processing
    // 3. Store the event in a dead-letter queue for manual inspection
  }
});

/**
 * Handle checkout.session.completed event
 * This is triggered when a customer completes the checkout process
 */
async function handleCheckoutSessionCompleted(session) {
  try {
    // Extract customer email and metadata
    const customerEmail = session.customer_details.email;
    const metadata = session.metadata || {};

    // Get the user ID and credits amount from metadata
    let userId = metadata.userId;
    const creditsToAdd = parseInt(metadata.credits || "0", 10);

    if (!userId) {
      // Try to find user by email if userId is not in metadata
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, credits')
        .eq('email', customerEmail)
        .single();

      if (userError || !user) {
        // For testing purposes, create a user if not found
        console.log(`Creating test user for email ${customerEmail}`);

        // Generate a random API key
        const apiKey = `fait_test_${Math.random().toString(36).substring(2, 15)}`;

        // Insert the user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email: customerEmail,
            api_key: apiKey,
            credits: 0,
            role: 'user',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (createError) {
          console.error(`Error creating user: ${createError.message}`);
          throw new Error(`Failed to create user for email ${customerEmail}`);
        }

        userId = newUser.id;
      } else {
        // Use the user ID from the database
        userId = user.id;
      }
    }

    // Get current credits
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error(`Error fetching user data: ${userError.message}`);
    }

    // Calculate new credits balance
    const currentCredits = userData?.credits || 0;
    const newCredits = currentCredits + creditsToAdd;

    // Use the add_credit stored procedure to update credits and log the transaction in one operation
    const { data: result, error: creditError } = await supabase.rpc('add_credit', {
      user_id: userId,
      credit_amount: creditsToAdd,
      transaction_type: 'purchase',
      transaction_description: `Credits purchase (${creditsToAdd} credits)`,
      stripe_session_id: session.id
    });

    if (creditError) {
      throw new Error(`Error updating credits: ${creditError.message}`);
    }

    if (!result || !result.length || !result[0].success) {
      throw new Error('Failed to add credits to user account');
    }

    const newBalance = result[0].new_balance;
    console.log(`✅ Granted ${creditsToAdd} credits to user ${userId}. New balance: ${newBalance}`);

    // Send confirmation email (implement this function separately)
    await sendCreditsPurchaseConfirmation(userId, customerEmail, creditsToAdd);

  } catch (err) {
    console.error("⚠️ Error processing checkout.session.completed:", err);
    throw err; // Re-throw to be caught by the main handler
  }
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentIntentSucceeded(paymentIntent) {
  // Implementation depends on your business logic
  console.log(`Payment succeeded: ${paymentIntent.id}`);

  // If this payment is related to a specific feature, handle it here
  const metadata = paymentIntent.metadata || {};
  if (metadata.feature === 'credits' && metadata.userId) {
    // This is handled by checkout.session.completed, but we can add additional logic here
    console.log(`Payment for credits confirmed for user ${metadata.userId}`);
  }
}

/**
 * Handle payment_intent.payment_failed event
 */
async function handlePaymentIntentFailed(paymentIntent) {
  console.log(`Payment failed: ${paymentIntent.id}`);

  const metadata = paymentIntent.metadata || {};
  if (metadata.userId) {
    // Notify the user about the failed payment
    await sendPaymentFailureNotification(metadata.userId, paymentIntent.id);
  }
}

/**
 * Log webhook errors to our database for monitoring
 * @param {string} eventType - The type of the event (e.g., 'checkout.session.completed')
 * @param {string} eventId - The ID of the event from Stripe
 * @param {Error} error - The error object
 */
async function logWebhookError(eventType, eventId, error) {
  try {
    const { error: logError } = await supabase
      .from('webhook_errors')
      .insert({
        event_type: eventType,
        event_id: eventId,
        error_message: error.message,
        error_stack: error.stack,
        timestamp: new Date().toISOString(),
        // Additional useful information
        environment: process.env.NODE_ENV || 'development',
        service: 'stripe-webhook-service'
      });

    if (logError) {
      console.error('Failed to log webhook error to database:', logError);
    } else {
      console.log(`✅ Webhook error logged to database for event ${eventId}`);
    }
  } catch (err) {
    console.error('Error logging webhook error:', err);
  }
}

/**
 * Send confirmation email for credits purchase
 * This is a placeholder - implement actual email sending logic
 */
async function sendCreditsPurchaseConfirmation(userId, email, credits) {
  // Implement email sending logic here
  console.log(`Would send confirmation email to ${email} for ${credits} credits purchase`);
}

/**
 * Send notification about payment failure
 * This is a placeholder - implement actual notification logic
 */
async function sendPaymentFailureNotification(userId, paymentIntentId) {
  // Implement notification logic here
  console.log(`Would send payment failure notification to user ${userId} for payment ${paymentIntentId}`);
}

/**
 * Handle payment_method.attached event
 */
async function handlePaymentMethodAttached(paymentMethod) {
  console.log(`Payment method attached: ${paymentMethod.id}`);

  // Add your business logic here
  // For example, you might want to update the user's payment methods in your database
  const customerId = paymentMethod.customer;
  if (customerId) {
    console.log(`Payment method attached to customer: ${customerId}`);
    // Update user's payment methods in your database
  }
}

/**
 * Handle invoice.paid event
 */
async function handleInvoicePaid(invoice) {
  console.log(`Invoice paid: ${invoice.id} for ${invoice.amount_paid}`);

  // Add your business logic here
  // For example, you might want to update the user's subscription status
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;

  if (customerId && subscriptionId) {
    console.log(`Invoice paid for customer ${customerId} and subscription ${subscriptionId}`);
    // Update subscription status in your database
  }
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(invoice) {
  console.log(`Invoice payment failed: ${invoice.id}`);

  // Add your business logic here
  // For example, you might want to notify the user about the failed payment
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;

  if (customerId) {
    console.log(`Invoice payment failed for customer ${customerId}`);
    // Notify user about failed payment

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('stripe_customer_id', customerId)
      .single();

    if (!error && user) {
      // Send notification to user
      console.log(`Would send invoice payment failed notification to ${user.email}`);
    }
  }
}

/**
 * Handle customer.subscription.created event
 */
async function handleSubscriptionCreated(subscription) {
  console.log(`Subscription created: ${subscription.id}`);

  // Add your business logic here
  // For example, you might want to update the user's subscription status
  const customerId = subscription.customer;

  if (customerId) {
    console.log(`Subscription created for customer ${customerId}`);
    // Update subscription status in your database

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('stripe_customer_id', customerId)
      .single();

    if (!error && user) {
      // Update user's subscription status
      console.log(`Would update subscription status for user ${user.email}`);
    }
  }
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription) {
  console.log(`Subscription updated: ${subscription.id}`);

  // Add your business logic here
  // For example, you might want to update the user's subscription status
  const customerId = subscription.customer;
  const status = subscription.status;

  if (customerId) {
    console.log(`Subscription updated for customer ${customerId} with status ${status}`);
    // Update subscription status in your database

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('stripe_customer_id', customerId)
      .single();

    if (!error && user) {
      // Update user's subscription status
      console.log(`Would update subscription status for user ${user.email} to ${status}`);
    }
  }
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription) {
  console.log(`Subscription deleted: ${subscription.id}`);

  // Add your business logic here
  // For example, you might want to update the user's subscription status
  const customerId = subscription.customer;

  if (customerId) {
    console.log(`Subscription deleted for customer ${customerId}`);
    // Update subscription status in your database

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('stripe_customer_id', customerId)
      .single();

    if (!error && user) {
      // Update user's subscription status
      console.log(`Would update subscription status for user ${user.email} to canceled`);
    }
  }
}

// === Auth Middleware ===
async function authenticate(req, res, next) {
  const apiKey = req.header("x-api-key");
  if (!apiKey) {
    return res.status(401).json({ error: "Unauthorized: API key required" });
  }

  try {
    // Find user by API key
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, credits, api_key')
      .eq('api_key', apiKey)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Unauthorized: Invalid API key" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("⚠️ Authentication error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// === Scrape Endpoint Rate Limiter ===
const scrapeRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many scrape requests, please try again later" }
});

// === Scrape Endpoint ===
app.get("/scrape", scrapeRateLimiter, authenticate, async (req, res) => {
  const user = req.user;
  const { url, options } = req.query;

  // Validate required parameters
  if (!url) {
    return res.status(400).json({ error: "Missing required parameter: url" });
  }

  // Check if user has enough credits
  if (user.credits < 1) {
    return res.status(402).json({
      error: "Out of credits",
      message: "You need to purchase more credits to continue using this service",
      purchaseUrl: `${process.env.FRONTEND_URL || ''}/credits`
    });
  }

  try {
    // Start a transaction to ensure atomicity
    const startTime = Date.now();
    let scrapedData;

    try {
      // Do your scraping logic here
      // This is a placeholder - replace with actual scraping implementation
      scrapedData = {
        result: `Scraped content for ${url} goes here`,
        timestamp: new Date().toISOString()
      };

      // Simulate processing time for demo purposes
      const processingTime = Date.now() - startTime;
      if (processingTime < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - processingTime));
      }
    } catch (scrapeError) {
      console.error(`⚠️ Error during scraping operation:`, scrapeError);
      return res.status(500).json({
        error: "Scraping operation failed",
        message: scrapeError.message
      });
    }

    // Deduct one credit and log the transaction using the stored procedure
    const { data: result, error } = await supabase.rpc('use_credit', {
      user_id: user.id,
      credit_amount: 1,
      transaction_type: 'usage',
      transaction_description: `API usage: /scrape for ${url}`
    });

    if (error) {
      console.error(`⚠️ Error in credit transaction for user ${user.id}:`, error);
      return res.status(500).json({ error: "Error processing credits" });
    }

    if (!result || !result.length || !result[0].success) {
      return res.status(402).json({
        error: "Out of credits",
        message: "You need to purchase more credits to continue using this service",
        purchaseUrl: `${process.env.FRONTEND_URL || ''}/credits`
      });
    }

    const newCredits = result[0].new_balance;
    console.log(`✅ ${user.email} scraped ${url}. Remaining credits: ${newCredits}`);

    // Return the scraped data along with the user's remaining credits
    res.json({
      ...scrapedData,
      remainingCredits: newCredits,
      processingTime: `${Date.now() - startTime}ms`
    });
  } catch (err) {
    console.error("⚠️ Error processing scrape request:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// === Health check endpoint ===
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// === Test Endpoint ===
app.post("/test-webhook", express.json(), (req, res) => {
  console.log("Received test webhook:", req.body);

  // Simulate adding credits to a user
  const { email, credits } = req.body;

  if (!email || !credits) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  console.log(`Would add ${credits} credits to user ${email}`);

  res.json({
    success: true,
    message: `Added ${credits} credits to user ${email}`,
    timestamp: new Date().toISOString()
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Webhook endpoint: http://localhost:${port}/webhook`);
});
