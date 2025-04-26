#!/bin/bash

# Exit on any error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="fait-444705"  # Your GCP project ID
REPO_NAME="fait-coop-platform"
BRANCH="main"

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
  "STRIPE_SECRET_KEY"
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

# Start a manual build with the correct logging options
echo -e "${YELLOW}Starting a manual build...${NC}"
gcloud builds submit \
  --config=cloudbuild.yaml \
  --log-type=CLOUD_LOGGING_ONLY \
  --substitutions="_SUPABASE_URL=$VITE_SUPABASE_URL,_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY,_SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY,_SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY,_JWT_SECRET=$JWT_SECRET,_VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID,_VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY,_STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY"

echo -e "${GREEN}Build submitted successfully!${NC}"
echo -e "You can monitor the build progress in the Cloud Build console:"
echo -e "https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID"
