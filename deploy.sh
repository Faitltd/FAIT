#!/bin/bash
set -e

# Configuration
PROJECT_ID="fait-444705"
IMAGE_NAME="fait-coop"
REGION="us-central1"
SERVICE_NAME="fait-coop"
DOMAIN="app.itsfait.com"

# Step 1: Build the Docker image
echo "Building Docker image..."
docker build -t gcr.io/$PROJECT_ID/$IMAGE_NAME:latest -f Dockerfile.simple .

# Step 2: Push the image to Google Container Registry
echo "Pushing image to Google Container Registry..."
docker push gcr.io/$PROJECT_ID/$IMAGE_NAME:latest

# Step 3: Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$IMAGE_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated

# Step 4: Map the domain using beta command
echo "Mapping domain to Cloud Run service..."
gcloud beta run domain-mappings create \
  --service $SERVICE_NAME \
  --domain $DOMAIN \
  --platform managed \
  --region $REGION

# Step 5: Check domain mapping status
echo "Checking domain mapping status..."
gcloud beta run domain-mappings list \
  --filter="DOMAIN=$DOMAIN" \
  --format="json"

echo "Deployment complete! Your application should be available at https://$DOMAIN once DNS propagates and SSL certificate is issued."
