#!/bin/bash

# Script to deploy to Cloud Run

# Default values
IMAGE_NAME="gcr.io/fait-444705/fait-coop-sveltekit"
TAG="v1"
SERVICE_NAME="fait-coop-sveltekit"
REGION="us-central1"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --tag=*)
      TAG="${1#*=}"
      shift
      ;;
    --service=*)
      SERVICE_NAME="${1#*=}"
      shift
      ;;
    --region=*)
      REGION="${1#*=}"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Full image name with tag
FULL_IMAGE_NAME="$IMAGE_NAME:$TAG"

echo "Deploying $FULL_IMAGE_NAME to Cloud Run service: $SERVICE_NAME in region: $REGION"

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --image=$FULL_IMAGE_NAME \
  --platform=managed \
  --region=$REGION \
  --allow-unauthenticated

# Check if deployment was successful
if [ $? -eq 0 ]; then
  echo "Deployment successful!"
else
  echo "Deployment failed!"
fi
