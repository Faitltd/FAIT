#!/bin/bash

# This script performs a full deployment of the FAIT Co-op platform
#
# Prerequisites:
# - Google Cloud CLI installed and configured
# - Docker installed locally
# - Domain ownership verified in Google Cloud Console
#
# Usage:
# ./scripts/full-deployment.sh your-domain.com

# Set text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Configuration
SERVICE_NAME="fait-coop"
REGION="us-central1"

# Check if domain argument is provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: Domain name is required.${NC}"
  echo -e "Usage: ./scripts/full-deployment.sh your-domain.com"
  exit 1
fi

DOMAIN=$1

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo -e "${RED}Error: Google Cloud CLI (gcloud) is not installed.${NC}"
  echo -e "Please install it from: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
  echo -e "${RED}Error: Docker is not installed.${NC}"
  echo -e "Please install it from: https://docs.docker.com/get-docker/"
  exit 1
fi

# Check if the user is logged in to gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
  echo -e "${RED}Error: You are not logged in to Google Cloud.${NC}"
  echo -e "Please run: gcloud auth login"
  exit 1
fi

# Step 1: Run tests
echo -e "\n${YELLOW}Step 1: Running tests...${NC}"
./scripts/run-all-tests.sh

if [ $? -ne 0 ]; then
  echo -e "${RED}Tests failed. Please fix the issues before deploying.${NC}"
  echo -e "You can continue anyway, but it's not recommended."
  echo -e "Do you want to continue? (y/n)"
  read -r CONTINUE
  if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Aborting deployment.${NC}"
    exit 1
  fi
fi

# Step 2: Deploy to Google Cloud Run
echo -e "\n${YELLOW}Step 2: Deploying to Google Cloud Run...${NC}"
./scripts/deploy-to-cloudrun.sh

if [ $? -ne 0 ]; then
  echo -e "${RED}Deployment failed. Please check the logs for errors.${NC}"
  exit 1
fi

# Step 3: Map domain to Cloud Run
echo -e "\n${YELLOW}Step 3: Mapping domain to Cloud Run...${NC}"
./scripts/map-domain-to-cloudrun.sh $DOMAIN

if [ $? -ne 0 ]; then
  echo -e "${RED}Domain mapping failed. Please check the logs for errors.${NC}"
  echo -e "You can try again later with: ./scripts/map-domain-to-cloudrun.sh $DOMAIN"
  echo -e "Do you want to continue with the rest of the deployment? (y/n)"
  read -r CONTINUE
  if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Aborting deployment.${NC}"
    exit 1
  fi
fi

# Step 4: Wait for DNS propagation
echo -e "\n${YELLOW}Step 4: Waiting for DNS propagation...${NC}"
echo -e "This can take up to 48 hours, but often it's much faster."
echo -e "You can check the status with: ./scripts/check-domain-status.sh $DOMAIN"
echo -e "Do you want to check the status now? (y/n)"
read -r CHECK_STATUS
if [[ "$CHECK_STATUS" =~ ^[Yy]$ ]]; then
  ./scripts/check-domain-status.sh $DOMAIN
fi

# Step 5: Set up Stripe webhook
echo -e "\n${YELLOW}Step 5: Setting up Stripe webhook...${NC}"
echo -e "This step requires your domain to be properly set up with DNS and SSL."
echo -e "If your domain is not yet ready, you can do this step later with:"
echo -e "node scripts/setup-stripe-webhook-cli.js $DOMAIN"
echo -e "Do you want to set up the Stripe webhook now? (y/n)"
read -r SETUP_WEBHOOK
if [[ "$SETUP_WEBHOOK" =~ ^[Yy]$ ]]; then
  node scripts/setup-stripe-webhook-cli.js $DOMAIN
fi

# Step 6: Final verification
echo -e "\n${YELLOW}Step 6: Final verification${NC}"
echo -e "Please perform these manual checks:"
echo -e "1. Visit your domain: https://$DOMAIN"
echo -e "2. Test authentication with: node scripts/test-auth.js"
echo -e "3. Test critical user flows (registration, login, etc.)"
echo -e "4. Test payment processing with test cards"

echo -e "\n${GREEN}Deployment process completed!${NC}"
echo -e "Some steps may require additional time to complete (DNS propagation, SSL certificate provisioning)."
echo -e "Use the check-domain-status.sh script to monitor the status of your domain setup."
