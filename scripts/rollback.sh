#!/bin/bash

# This script rolls back to a previous version of the application

# Set variables
PROJECT_ID="fait-444705"
SERVICE_NAME="fait-coop-main"
REGION="us-central1"

# Authenticate with Google Cloud (if not already authenticated)
echo "Authenticating with Google Cloud..."
gcloud auth login

# Set the project
echo "Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# List the revisions
echo "Listing revisions..."
gcloud run revisions list --service=$SERVICE_NAME --region=$REGION --platform=managed

# Ask for the revision to rollback to
read -p "Enter the revision name to rollback to: " REVISION_NAME

# Confirm before rolling back
read -p "Are you sure you want to rollback to revision $REVISION_NAME? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Rollback to the specified revision
  echo "Rolling back to revision $REVISION_NAME..."
  gcloud run services update-traffic $SERVICE_NAME \
    --to-revisions=$REVISION_NAME=100 \
    --region=$REGION \
    --platform=managed
  
  echo "Rollback complete."
else
  echo "Rollback cancelled."
fi
