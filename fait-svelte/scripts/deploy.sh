#!/bin/bash

# Exit on error
set -e

# Set default values
PROJECT_ID="fait-444705"
SERVICE_NAME="fait-coop-main"
REGION="us-central1"
BUILD_ENV="production"

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
    --env)
      BUILD_ENV="$2"
      shift
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "Deploying to Google Cloud Run..."
echo "Project ID: $PROJECT_ID"
echo "Service Name: $SERVICE_NAME"
echo "Region: $REGION"
echo "Environment: $BUILD_ENV"

# Build the Docker image
echo "Building Docker image..."
docker build --build-arg BUILD_ENV=$BUILD_ENV -t gcr.io/$PROJECT_ID/$SERVICE_NAME:latest .

# Push the Docker image to Google Container Registry
echo "Pushing Docker image to Google Container Registry..."
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:latest

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=1 \
  --max-instances=10 \
  --concurrency=80 \
  --timeout=300s \
  --set-env-vars="NODE_ENV=production" \
  --project $PROJECT_ID

echo "Deployment completed successfully!"
