#!/bin/bash

# Exit on error
set -e

# Set variables
PROJECT_ID="fait-444705"
SERVICE_NAME="stripe-webhook-service"
REGION="us-central1"

# Build and push the container
echo "Building and pushing container to Google Container Registry..."
gcloud builds submit ./stripe-webhook-service --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Check if environment variables are set
if [ -z "$STRIPE_SECRET_KEY" ] || [ -z "$STRIPE_WEBHOOK_SECRET" ] || [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Error: Required environment variables are not set."
  echo "Please set the following environment variables:"
  echo "  - STRIPE_SECRET_KEY"
  echo "  - STRIPE_WEBHOOK_SECRET"
  echo "  - SUPABASE_URL"
  echo "  - SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars \
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY,\
STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET,\
SUPABASE_URL=$SUPABASE_URL,\
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY,\
FRONTEND_URL=$FRONTEND_URL,\
NODE_ENV=production

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format="value(status.url)")

echo "Deployment complete!"
echo "Service URL: $SERVICE_URL"
echo ""
echo "Endpoints:"
echo "- Webhook: $SERVICE_URL/webhook"
echo "- Checkout: $SERVICE_URL/api/create-checkout-session"
echo "- Scrape: $SERVICE_URL/scrape"
echo "- Health: $SERVICE_URL/health"
echo ""
echo "To test the API, use:"
echo "curl -H \"x-api-key: YOUR_API_KEY\" \"$SERVICE_URL/scrape?url=https://example.com\""
echo ""
echo "Don't forget to update your Stripe webhook URL in the Stripe dashboard to:"
echo "$SERVICE_URL/webhook"
