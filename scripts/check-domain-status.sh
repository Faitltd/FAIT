#!/bin/bash

# This script checks the status of the custom domain mapping in Google Cloud Run
#
# Prerequisites:
# - Google Cloud CLI installed and configured
#
# Usage:
# ./scripts/check-domain-status.sh your-domain.com

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
  echo -e "Usage: ./scripts/check-domain-status.sh your-domain.com"
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

echo -e "${YELLOW}Checking domain mapping status for $DOMAIN...${NC}"

# Get domain mapping status
MAPPING_STATUS=$(gcloud beta run domain-mappings list --region=$REGION --filter="DOMAIN=$DOMAIN" --format="json")

if [ -z "$MAPPING_STATUS" ] || [ "$MAPPING_STATUS" == "[]" ]; then
  echo -e "${RED}Domain mapping not found for $DOMAIN.${NC}"
  echo -e "You need to create a domain mapping first:"
  echo -e "gcloud beta run domain-mappings create --service=$SERVICE_NAME --domain=$DOMAIN --region=$REGION --platform=managed"
  exit 1
fi

# Parse the status
CERTIFICATE_STATUS=$(echo $MAPPING_STATUS | jq -r '.[0].status.certificateStatus')
RESOURCE_RECORDS=$(echo $MAPPING_STATUS | jq -r '.[0].status.resourceRecords')

echo -e "${YELLOW}Domain: $DOMAIN${NC}"
echo -e "${YELLOW}Certificate Status: $CERTIFICATE_STATUS${NC}"

if [ "$CERTIFICATE_STATUS" == "ACTIVE" ]; then
  echo -e "${GREEN}Certificate is active and domain is properly configured!${NC}"
else
  echo -e "${YELLOW}Certificate is not yet active. This can take up to 24 hours.${NC}"
  echo -e "${YELLOW}Please ensure you have configured the following DNS records:${NC}"
  echo $RESOURCE_RECORDS | jq -r '.[] | "Type: \(.type), Name: \(.name), Data: \(.data)"'
fi

# Check if the domain is accessible
echo -e "${YELLOW}Checking if the domain is accessible...${NC}"
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200\|301\|302"; then
  echo -e "${GREEN}Domain is accessible!${NC}"
else
  echo -e "${RED}Domain is not accessible yet.${NC}"
  echo -e "This could be due to:"
  echo -e "1. DNS propagation is still in progress (can take up to 48 hours)"
  echo -e "2. SSL certificate is not yet active"
  echo -e "3. DNS records are not correctly configured"
fi

echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. If DNS records are not configured, add them to your domain registrar"
echo -e "2. Wait for DNS propagation and certificate provisioning (up to 24-48 hours)"
echo -e "3. Run this script again to check the status"
