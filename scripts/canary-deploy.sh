#!/bin/bash

# This script performs a canary deployment to gradually roll out changes

# Set variables
PROJECT_ID="fait-444705"
SERVICE_NAME="fait-coop-main"
REGION="us-central1"
IMAGE_TAG=$1  # Pass the image tag as an argument

if [ -z "$IMAGE_TAG" ]; then
  echo "Error: Image tag not provided"
  echo "Usage: $0 <image-tag>"
  exit 1
fi

# Authenticate with Google Cloud (if not already authenticated)
echo "Authenticating with Google Cloud..."
gcloud auth login

# Set the project
echo "Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Get the current revision
CURRENT_REVISION=$(gcloud run revisions list --service=$SERVICE_NAME --region=$REGION --platform=managed --format="value(metadata.name)" | head -1)
echo "Current revision: $CURRENT_REVISION"

# Deploy the new version but don't send any traffic to it yet
echo "Deploying new version..."
gcloud run deploy $SERVICE_NAME \
  --image=gcr.io/$PROJECT_ID/fait-coop-main:$IMAGE_TAG \
  --platform=managed \
  --region=$REGION \
  --no-traffic \
  --tag=canary \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --concurrency=80 \
  --timeout=300s \
  --project $PROJECT_ID

# Get the new revision
NEW_REVISION=$(gcloud run revisions list --service=$SERVICE_NAME --region=$REGION --platform=managed --format="value(metadata.name)" | head -1)
echo "New revision: $NEW_REVISION"

# Start with 5% traffic to the new version
echo "Sending 5% traffic to the new version..."
gcloud run services update-traffic $SERVICE_NAME \
  --to-revisions=$CURRENT_REVISION=95,$NEW_REVISION=5 \
  --region=$REGION \
  --platform=managed

echo "Canary deployment started with 5% traffic to the new version."
echo "Monitor the deployment and gradually increase traffic using:"
echo "gcloud run services update-traffic $SERVICE_NAME --to-revisions=$CURRENT_REVISION=XX,$NEW_REVISION=YY --region=$REGION --platform=managed"
echo "Where XX and YY are the percentages of traffic to the current and new revisions."

# Ask if the user wants to continue with the gradual rollout
read -p "Do you want to continue with the gradual rollout? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Wait 5 minutes and increase to 20%
  echo "Waiting 5 minutes before increasing traffic to 20%..."
  sleep 300
  gcloud run services update-traffic $SERVICE_NAME \
    --to-revisions=$CURRENT_REVISION=80,$NEW_REVISION=20 \
    --region=$REGION \
    --platform=managed
  
  # Wait 5 minutes and increase to 50%
  echo "Waiting 5 minutes before increasing traffic to 50%..."
  sleep 300
  gcloud run services update-traffic $SERVICE_NAME \
    --to-revisions=$CURRENT_REVISION=50,$NEW_REVISION=50 \
    --region=$REGION \
    --platform=managed
  
  # Wait 5 minutes and increase to 100%
  echo "Waiting 5 minutes before increasing traffic to 100%..."
  sleep 300
  gcloud run services update-traffic $SERVICE_NAME \
    --to-revisions=$NEW_REVISION=100 \
    --region=$REGION \
    --platform=managed
  
  echo "Canary deployment complete. 100% of traffic is now directed to the new version."
else
  echo "Manual rollout selected. Use the command above to gradually increase traffic."
fi
