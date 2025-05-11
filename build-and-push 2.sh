#!/bin/bash

# Exit on any error
set -e

# Configuration - EDIT THESE VALUES
PROJECT_ID="your-gcp-project-id"  # Replace with your actual GCP project ID
SERVICE_NAME="fait-coop"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Build and submit the container
echo -e "${YELLOW}Building and submitting container to Google Container Registry...${NC}"
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

echo -e "${GREEN}Build complete!${NC}"
echo -e "Your container image is available at: gcr.io/$PROJECT_ID/$SERVICE_NAME"
echo -e "${YELLOW}Now you can run ./deploy-simple.sh to deploy this image to Cloud Run${NC}"
