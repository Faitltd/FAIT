#!/bin/bash

# Exit on any error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration - EDIT THESE VALUES
PROJECT_ID="fait-444705"  # Your GCP project ID
REPO_NAME="fait-coop-platform"
BRANCH="main"
DESCRIPTION="Auto-deploy to Cloud Run on push to main branch"

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

# Enable required APIs
echo -e "${YELLOW}Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Delete the old trigger if it exists
echo -e "${YELLOW}Checking for existing trigger...${NC}"
if gcloud builds triggers describe deploy-to-cloud-run --project=$PROJECT_ID &>/dev/null; then
  echo -e "${YELLOW}Deleting existing trigger...${NC}"
  gcloud builds triggers delete deploy-to-cloud-run --project=$PROJECT_ID --quiet
fi

# Create a new Cloud Build trigger with CLOUD_LOGGING_ONLY
echo -e "${YELLOW}Creating new Cloud Build trigger...${NC}"
gcloud builds triggers create github \
  --name="deploy-to-cloud-run" \
  --description="$DESCRIPTION" \
  --repo="https://github.com/Faitltd/$REPO_NAME" \
  --branch-pattern="$BRANCH" \
  --build-config="cloudbuild.yaml" \
  --log-type=CLOUD_LOGGING_ONLY \
  --substitutions="_SUPABASE_URL=$VITE_SUPABASE_URL,_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY,_SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY,_SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY,_JWT_SECRET=$JWT_SECRET,_VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID,_VITE_STRIPE_PUBLIC_KEY=$VITE_STRIPE_PUBLIC_KEY,_STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY"

echo -e "${GREEN}New Cloud Build trigger created successfully!${NC}"
echo -e "Now you can push to your $BRANCH branch to trigger a build and deployment:"
echo -e "${YELLOW}git add .${NC}"
echo -e "${YELLOW}git commit -m \"Activate Cloud Build deployment\"${NC}"
echo -e "${YELLOW}git push origin $BRANCH${NC}"
echo -e "\n${YELLOW}Watch your build progress at:${NC}"
echo -e "https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID"
