#!/bin/bash

# This script monitors the deployed application

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

# Get the URL of the service
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --platform=managed --format="value(status.url)")
echo "Service URL: $SERVICE_URL"

# Check the health endpoint
echo "Checking health endpoint..."
curl -s "$SERVICE_URL/health" | jq .

# Check the version endpoint
echo "Checking version endpoint..."
curl -s "$SERVICE_URL/api/version" | jq .

# Get the service metrics
echo "Getting service metrics..."
gcloud run services describe $SERVICE_NAME --region=$REGION --platform=managed --format="yaml(status.traffic, status.conditions)"

# Get the logs
echo "Getting recent logs..."
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" --limit=10 --format="table(timestamp, severity, textPayload)"

# Check the domain mapping
echo "Checking domain mapping..."
gcloud run domain-mappings describe --domain=$DOMAIN --region=$REGION --platform=managed || echo "Domain mapping not found"

echo "Monitoring complete."
