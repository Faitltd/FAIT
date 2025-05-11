#!/bin/bash

# This script deploys the FAIT Co-op platform to Google Cloud Run with optimized settings
#
# Prerequisites:
# - Google Cloud CLI installed and configured
# - Docker installed locally
# - Secrets set up in Google Secret Manager (run setup-gcp-secrets.sh first)
#
# Usage:
# ./scripts/deploy-to-cloudrun-optimized.sh

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
SERVICE_ACCOUNT="fait-coop-sa@${PROJECT_ID}.iam.gserviceaccount.com"

# Load environment variables from .env file
if [ -f .env ]; then
  echo -e "${YELLOW}Loading environment variables from .env file...${NC}"
  export $(grep -v '^#' .env | xargs)
else
  echo -e "${RED}Error: .env file not found.${NC}"
  exit 1
fi

# Check if required environment variables are set
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  echo -e "${RED}Error: Required environment variables are not set.${NC}"
  echo "Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file."
  exit 1
fi

# Configure gcloud
echo -e "${YELLOW}Configuring gcloud...${NC}"
gcloud config set project $PROJECT_ID

# Build the Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build \
  --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
  --build-arg VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
  --build-arg VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY \
  --build-arg VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY \
  -f Dockerfile.cloudrun.fixed \
  -t $IMAGE_NAME .

# Push the image to Google Container Registry
echo -e "${YELLOW}Pushing image to Google Container Registry...${NC}"
docker push $IMAGE_NAME

# Deploy to Cloud Run with optimized settings
echo -e "${YELLOW}Deploying to Cloud Run with optimized settings...${NC}"
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --service-account $SERVICE_ACCOUNT \
  --min-instances=0 \
  --max-instances=10 \
  --concurrency=80 \
  --cpu=1 \
  --memory=1Gi \
  --timeout=300s \
  --set-env-vars="VITE_SUPABASE_URL=$VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY,VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID,VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY,VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY" \
  --set-secrets="SUPABASE_SERVICE_KEY=supabase-service-key:latest,JWT_SECRET=jwt-secret:latest,STRIPE_SECRET_KEY=stripe-secret-key:latest"

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "Your service is now available at: $(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')"
echo -e "It is configured with:"
echo -e "  - Connection pooling for Supabase"
echo -e "  - Secure secrets management"
echo -e "  - Optimized scaling parameters (0-10 instances, 80 concurrent requests)"
echo -e "  - 1 CPU, 1GB memory, 5-minute timeout"
