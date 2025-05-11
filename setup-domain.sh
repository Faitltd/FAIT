#!/bin/bash
set -e

# Configuration
SERVICE_NAME="fait-coop"
DOMAIN="app.itsfait.com"
REGION="us-central1"

# Map the domain using beta command
echo "Mapping domain to Cloud Run service..."
gcloud beta run domain-mappings create \
  --service $SERVICE_NAME \
  --domain $DOMAIN \
  --platform managed \
  --region $REGION

# Check domain mapping status
echo "Checking domain mapping status..."
gcloud beta run domain-mappings list \
  --filter="DOMAIN=$DOMAIN" \
  --format="json"

echo "Domain mapping setup complete! Your application should be available at https://$DOMAIN once DNS propagates and SSL certificate is issued."
