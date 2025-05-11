const express = require("express");
const Stripe = require("stripe");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Use raw body parser for Stripe webhook only
app.use("/webhook", bodyParser.raw({ type: "application/json" }));
app.use(express.json());

// === FAKE IN-MEMORY DB ===
const users = {
  "test-api-key-123": { email: "user@example.com", credits: 10 },
  "another-key-456": { email: "someone@else.com", credits: 0 }
};

// === Stripe Webhook: Add credits ===
app.get("/webhook", (req, res) => {
  res.status(200).send("Stripe webhook endpoint. POST requests only.");
});

app.post("/webhook", (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️  Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const customerEmail = session.customer_details.email;

    // Map email to user (replace with real DB logic)
    for (const [apiKey, user] of Object.entries(users)) {
      if (user.email === customerEmail) {
        user.credits += 500; // or however many per purchase
        console.log(`✅ Granted 500 credits to ${customerEmail}`);
      }
    }
  }

  res.sendStatus(200);
});

// === Auth Middleware ===
function authenticate(req, res, next) {
  const apiKey = req.header("x-api-key");
  if (!apiKey || !users[apiKey]) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.user = users[apiKey];
  req.apiKey = apiKey;
  next();
}

// === Scrape Endpoint ===
app.get("/scrape", authenticate, (req, res) => {
  const user = req.user;

  if (user.credits < 1) {
    return res.status(402).json({ error: "Out of credits" });
  }

  // Do your scraping logic here
  const data = {
    result: "Scraped content goes here"
  };

  // Deduct one credit
  user.credits -= 1;

  console.log(`✅ ${user.email} scraped. Remaining credits: ${user.credits}`);
  res.json({ ...data, remainingCredits: user.credits });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Webhook endpoint: http://localhost:${port}/webhook`);
});
