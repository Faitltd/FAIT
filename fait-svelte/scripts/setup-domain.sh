#!/bin/bash

# Exit on error
set -e

# Set default values
PROJECT_ID="fait-444705"
SERVICE_NAME="fait-coop-main"
REGION="us-central1"
DOMAIN="itsfait.com"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --project)
      PROJECT_ID="$2"
      shift
      shift
      ;;
    --service)
      SERVICE_NAME="$2"
      shift
      shift
      ;;
    --region)
      REGION="$2"
      shift
      shift
      ;;
    --domain)
      DOMAIN="$2"
      shift
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "Setting up domain mapping for $DOMAIN..."
echo "Project ID: $PROJECT_ID"
echo "Service Name: $SERVICE_NAME"
echo "Region: $REGION"

# Create domain mapping
echo "Creating domain mapping..."
gcloud run domain-mappings create \
  --service $SERVICE_NAME \
  --domain $DOMAIN \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID

# Get DNS records
echo "Getting DNS records..."
gcloud run domain-mappings describe \
  --domain $DOMAIN \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID

echo "Domain mapping setup completed!"
echo "Please create the DNS records shown above with your domain registrar."
