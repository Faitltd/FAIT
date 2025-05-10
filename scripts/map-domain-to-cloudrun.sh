#!/bin/bash

# This script maps a custom domain to your Cloud Run service
#
# Prerequisites:
# - Google Cloud CLI installed and configured
# - Domain ownership verified in Google Cloud Console
#
# Usage:
# ./scripts/map-domain-to-cloudrun.sh your-domain.com

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
  echo -e "Usage: ./scripts/map-domain-to-cloudrun.sh your-domain.com"
  exit 1
fi

DOMAIN=$1

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo -e "${RED}Error: Google Cloud CLI (gcloud) is not installed.${NC}"
  echo -e "Please install it from: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# Check if the user is logged in to gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
  echo -e "${RED}Error: You are not logged in to Google Cloud.${NC}"
  echo -e "Please run: gcloud auth login"
  exit 1
fi

# Check if domain is already mapped
echo -e "${YELLOW}Checking if domain is already mapped...${NC}"
EXISTING_MAPPING=$(gcloud beta run domain-mappings list --region=$REGION --filter="DOMAIN=$DOMAIN" --format="json")

if [ -n "$EXISTING_MAPPING" ] && [ "$EXISTING_MAPPING" != "[]" ]; then
  echo -e "${YELLOW}Domain $DOMAIN is already mapped to a Cloud Run service.${NC}"
  echo -e "Do you want to overwrite this mapping? (y/n)"
  read -r OVERWRITE
  if [[ ! "$OVERWRITE" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Aborting.${NC}"
    exit 0
  fi
fi

# Create domain mapping
echo -e "${YELLOW}Mapping domain $DOMAIN to Cloud Run service $SERVICE_NAME...${NC}"
gcloud beta run domain-mappings create --service=$SERVICE_NAME --domain=$DOMAIN --region=$REGION --platform=managed

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Domain mapping created successfully!${NC}"

  # Get the resource records
  echo -e "${YELLOW}Retrieving DNS configuration...${NC}"
  MAPPING_STATUS=$(gcloud beta run domain-mappings list --region=$REGION --filter="DOMAIN=$DOMAIN" --format="json")
  RESOURCE_RECORDS=$(echo $MAPPING_STATUS | jq -r '.[0].status.resourceRecords')

  echo -e "${YELLOW}Please add the following DNS records to your domain:${NC}"
  echo $RESOURCE_RECORDS | jq -r '.[] | "Type: \(.type), Name: \(.name), Data: \(.data)"'

  echo -e "\n${YELLOW}After adding these DNS records, you can check the status with:${NC}"
  echo -e "./scripts/check-domain-status.sh $DOMAIN"
else
  echo -e "${RED}Failed to create domain mapping.${NC}"
  echo -e "Please ensure that your domain is verified in Google Cloud Console."
  echo -e "Go to: https://console.cloud.google.com/apis/credentials/domainverification"
  exit 1
fi
