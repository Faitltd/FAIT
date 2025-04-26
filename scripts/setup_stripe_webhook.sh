#!/bin/bash

# This script sets up the Stripe webhook for the FAIT Cooperative Platform
#
# Prerequisites:
# - Stripe CLI installed (https://stripe.com/docs/stripe-cli)
# - Stripe API key set in environment variable STRIPE_SECRET_KEY
# - Supabase project set up and running
#
# Usage:
# export STRIPE_SECRET_KEY=sk_test_your_key
# ./scripts/setup_stripe_webhook.sh

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
  echo "Error: Stripe CLI is not installed. Please install it first."
  echo "See: https://stripe.com/docs/stripe-cli"
  exit 1
fi

# Check if STRIPE_SECRET_KEY is set
if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "Error: STRIPE_SECRET_KEY environment variable is not set."
  echo "Please set it with: export STRIPE_SECRET_KEY=sk_test_your_key"
  exit 1
fi

# Get Supabase project URL
echo "Enter your Supabase project URL (e.g., https://your-project.supabase.co):"
read SUPABASE_URL

# Create the webhook endpoint
echo "Creating Stripe webhook endpoint..."
WEBHOOK_URL="${SUPABASE_URL}/functions/v1/stripe-webhook"

# Create the webhook using Stripe CLI
WEBHOOK_RESPONSE=$(stripe webhook create --api-key $STRIPE_SECRET_KEY --url $WEBHOOK_URL --connect false --events "checkout.session.completed,invoice.payment_succeeded,invoice.payment_failed,customer.subscription.updated,customer.subscription.deleted")

# Extract the webhook secret
WEBHOOK_SECRET=$(echo "$WEBHOOK_RESPONSE" | grep -o "whsec_[a-zA-Z0-9]*")

if [ -z "$WEBHOOK_SECRET" ]; then
  echo "Error: Failed to create webhook or extract webhook secret."
  exit 1
fi

echo "Webhook created successfully!"
echo "Webhook URL: $WEBHOOK_URL"
echo "Webhook Secret: $WEBHOOK_SECRET"
echo ""
echo "Please set the following environment variables in your Supabase project:"
echo "STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET"
echo ""
echo "You can set these variables in the Supabase dashboard under Settings > API > Environment Variables."
