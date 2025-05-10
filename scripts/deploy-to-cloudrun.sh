#!/bin/bash

# This script deploys the FAIT Co-op platform to Google Cloud Run
#
# Prerequisites:
# - Google Cloud CLI installed and configured
# - Docker installed locally
#
# Usage:
# ./scripts/deploy-to-cloudrun.sh

# Set text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="fait-444705"  # Your actual GCP project ID
SERVICE_NAME="fait-coop"
REGION="us-central1"  # Change to your preferred region
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"

# Load environment variables from .env file
if [ -f .env ]; then
  echo -e "${YELLOW}Loading environment variables from .env file...${NC}"
  export $(grep -v '^#' .env | xargs)
else
  echo -e "${RED}Error: .env file not found.${NC}"
  exit 1
fi

# Check if required environment variables are set
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ] || [ -z "$VITE_STRIPE_PUBLIC_KEY" ]; then
  echo -e "${RED}Error: Required environment variables are missing.${NC}"
  exit 1
fi

# Build the Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build \
  --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
  --build-arg VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
  --build-arg VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY \
  --build-arg VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY \
  --build-arg SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY \
  --build-arg SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  --build-arg JWT_SECRET=$JWT_SECRET \
  -f Dockerfile.cloudrun.fixed \
  -t $IMAGE_NAME .

# Push the image to Google Container Registry
echo -e "${YELLOW}Pushing image to Google Container Registry...${NC}"
docker push $IMAGE_NAME

# Deploy to Cloud Run
echo -e "${YELLOW}Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY,SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY,SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY,JWT_SECRET=$JWT_SECRET,STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET"

# Get the deployed URL
DEPLOYED_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)")

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "Your application is available at: ${GREEN}$DEPLOYED_URL${NC}"
echo -e "Next steps:"
echo -e "1. Set up your custom domain by following the instructions in docs/cloudrun-domain-setup.md"
echo -e "2. Configure Stripe webhook in the Stripe dashboard to point to your domain"
echo -e "3. Test the application to ensure everything is working correctly"
