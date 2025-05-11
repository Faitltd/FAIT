#!/bin/bash

# Exit on any error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration - edit these values
PROJECT_ID="your-gcp-project-id"  # Replace with your actual GCP project ID
SERVICE_NAME="fait-coop"
REGION="us-central1"  # Change to your preferred region

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${RED}Error: .env file not found!${NC}"
  echo -e "Please create a .env file with your environment variables."
  exit 1
fi

# Load environment variables from .env file
echo -e "${YELLOW}Loading environment variables from .env file...${NC}"
export $(grep -v '^#' .env | xargs)

# Verify required environment variables
required_vars=(
  "VITE_SUPABASE_URL"
  "VITE_SUPABASE_ANON_KEY"
  "VITE_GOOGLE_CLIENT_ID"
  "VITE_STRIPE_PUBLIC_KEY"
  "SUPABASE_SERVICE_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "JWT_SECRET"
)

missing_vars=0
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo -e "${RED}Error: $var is not set in .env file${NC}"
    missing_vars=1
  fi
done

if [ $missing_vars -eq 1 ]; then
  echo -e "${RED}Please set all required environment variables in .env file${NC}"
  exit 1
fi

# Authenticate with Google Cloud (if not already authenticated)
echo -e "${YELLOW}Authenticating with Google Cloud...${NC}"
gcloud auth login

# Set the project
echo -e "${YELLOW}Setting Google Cloud project to $PROJECT_ID...${NC}"
gcloud config set project $PROJECT_ID

# Build and submit the container
echo -e "${YELLOW}Building and submitting container to Google Container Registry...${NC}"
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy to Cloud Run with environment variables
echo -e "${YELLOW}Deploying to Cloud Run with environment variables...${NC}"
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="VITE_SUPABASE_URL=$VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY,VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID,VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY,SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY,SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY,JWT_SECRET=$JWT_SECRET"

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "Your service is now available at: $(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')"
