# Stripe Webhook Service for FAIT 2.0

A service to handle Stripe webhooks, manage user credits, and provide a secure API for the FAIT 2.0 platform.

## Features

- Processes Stripe webhook events for credit purchases
- Securely manages user credits with transaction support
- Provides a rate-limited API for scraping operations
- Includes monitoring, logging, and security features
- Supports database migrations for easy setup

## Setup

### Prerequisites

- Node.js 14+ and npm
- PostgreSQL database (via Supabase)
- Stripe account with API keys

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Application Configuration
   PORT=8080
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development
   ```

3. Set up the database:
   ```bash
   # Open the Supabase SQL Editor
   # Copy the contents of db/direct-setup.sql and run it in the SQL Editor
   ```

4. Start the service:
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

### Stripe Configuration

1. Create products and prices in your Stripe dashboard:
   - Create a product called "Credits"
   - Add three price points:
     - 100 credits: $9.99 (one-time)
     - 500 credits: $39.99 (one-time)
     - 1000 credits: $69.99 (one-time)
   - Note the price IDs for each

2. Update the `CREDIT_PACKAGES` object in `api/create-checkout-session.js` with your price IDs.

3. Set up a webhook in your Stripe dashboard:
   - Go to Developers > Webhooks
   - Add an endpoint: `https://your-service-url.com/webhook/stripe`
   - Select events to listen for:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Get the webhook signing secret and add it to your `.env` file

## API Endpoints

### Stripe Webhook
`POST /webhook/stripe`

Handles Stripe webhook events. Configure your Stripe webhook to point to this endpoint.

### Create Checkout Session
`POST /api/create-checkout-session`

Creates a Stripe checkout session for purchasing credits.

**Request Body:**
```json
{
  "priceId": "credits-500",
  "successUrl": "https://your-site.com/success",
  "cancelUrl": "https://your-site.com/cancel"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_..."
}
```

### Scrape
`GET /scrape?url=https://example.com`

Requires authentication via API key in the `x-api-key` header.

**Query Parameters:**
- `url` (required): The URL to scrape
- `options` (optional): JSON string of scraping options

**Response:**
```json
{
  "result": "Scraped content...",
  "timestamp": "2023-05-03T12:34:56.789Z",
  "remainingCredits": 42,
  "processingTime": "123ms"
}
```

**Error Responses:**
- 400 Bad Request: If required parameters are missing
- 401 Unauthorized: If no API key or invalid API key is provided
- 402 Payment Required: If the user has no credits
- 429 Too Many Requests: If rate limit is exceeded

### Health Check
`GET /health`

Returns the service health status.

## Security Features

- Rate limiting to prevent abuse
- Helmet for secure HTTP headers
- Request logging
- Webhook signature verification
- Database transaction support for credit operations

## Monitoring

- Access logs in `logs/access.log`
- Webhook errors stored in the `webhook_errors` table
- Health check endpoint for uptime monitoring

## Maintenance

### Cleaning Up Old Events

Run the cleanup job to remove old processed events:

```bash
npm run cleanup:events
```

You can set up a cron job to run this regularly using the provided script:

```bash
./setup-cron.sh
```

This will add a cron job to run at midnight every day:

```
0 0 * * * cd /path/to/stripe-webhook-service && npm run cleanup:events
```

## Deployment

### Docker

Build and run with Docker:

```bash
docker build -t stripe-webhook-service .
docker run -p 8080:8080 --env-file .env stripe-webhook-service
```

### Google Cloud Run

1. Set up secrets in Google Secret Manager:
   ```bash
   ./setup-secrets.sh
   ```

2. Deploy to Google Cloud Run:
   ```bash
   ./deploy-to-cloud-run.sh
   ```

## Frontend Integration

1. Add the `CreditsPurchaseForm` component to your React application
2. Configure the Stripe public key in your frontend environment
3. Add the `CreditsPage` to your application routes

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
