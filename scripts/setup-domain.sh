#!/bin/bash

# This script sets up a custom domain mapping for Cloud Run

# Set variables
PROJECT_ID="fait-444705"
SERVICE_NAME="fait-coop-main"
REGION="us-central1"
DOMAIN="fait-coop.com"  # Replace with your actual domain

# Authenticate with Google Cloud (if not already authenticated)
echo "Authenticating with Google Cloud..."
gcloud auth login

# Set the project
echo "Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Map the domain to the Cloud Run service
echo "Mapping domain $DOMAIN to Cloud Run service $SERVICE_NAME..."
gcloud run domain-mappings create \
  --service=$SERVICE_NAME \
  --domain=$DOMAIN \
  --region=$REGION \
  --platform=managed

# Get the DNS records that need to be created
echo "Getting DNS records..."
gcloud run domain-mappings describe \
  --domain=$DOMAIN \
  --region=$REGION \
  --platform=managed

echo "Please create the DNS records shown above with your domain registrar."
echo "Once the DNS records are created and propagated, your domain will be mapped to the Cloud Run service."
