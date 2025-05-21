#!/bin/bash

# This script cleans up the simple site after deploying the complex one

# Set variables
PROJECT_ID="fait-444705"
SIMPLE_SERVICE_NAME="fait-coop"  # The name of the simple site service
REGION="us-central1"

# Authenticate with Google Cloud (if not already authenticated)
echo "Authenticating with Google Cloud..."
gcloud auth login

# Set the project
echo "Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Check if the simple site service exists
if gcloud run services describe $SIMPLE_SERVICE_NAME --region=$REGION --platform=managed &> /dev/null; then
  # Get the URL of the simple site
  SIMPLE_URL=$(gcloud run services describe $SIMPLE_SERVICE_NAME --region=$REGION --platform=managed --format="value(status.url)")
  echo "Simple site URL: $SIMPLE_URL"
  
  # Confirm before deleting
  read -p "Are you sure you want to delete the simple site service? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Delete the simple site service
    echo "Deleting simple site service..."
    gcloud run services delete $SIMPLE_SERVICE_NAME --region=$REGION --platform=managed --quiet
    
    echo "Simple site service deleted."
  else
    echo "Deletion cancelled."
  fi
else
  echo "Simple site service not found."
fi

# Check for and delete old container images
echo "Checking for old container images..."
OLD_IMAGES=$(gcloud container images list-tags gcr.io/$PROJECT_ID/$SIMPLE_SERVICE_NAME --format="value(digest)" --limit=10)

if [ -n "$OLD_IMAGES" ]; then
  echo "Found old container images:"
  echo "$OLD_IMAGES"
  
  # Confirm before deleting
  read -p "Are you sure you want to delete these old container images? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Delete the old container images
    echo "Deleting old container images..."
    for DIGEST in $OLD_IMAGES; do
      gcloud container images delete gcr.io/$PROJECT_ID/$SIMPLE_SERVICE_NAME@$DIGEST --quiet
    done
    
    echo "Old container images deleted."
  else
    echo "Deletion cancelled."
  fi
else
  echo "No old container images found."
fi

echo "Cleanup complete."
