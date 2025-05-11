#!/bin/bash

# Script to build Docker images for Cloud Run (amd64 architecture)

# Default values
IMAGE_NAME="gcr.io/fait-444705/fait-coop"
TAG="v1"
PLATFORM="linux/amd64"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --tag=*)
      TAG="${1#*=}"
      shift
      ;;
    --platform=*)
      PLATFORM="${1#*=}"
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

echo "Building Docker image: $FULL_IMAGE_NAME for platform: $PLATFORM"

# Build the Docker image with platform flag
docker build --platform=$PLATFORM -t $FULL_IMAGE_NAME .

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "Build successful!"
  echo "To push the image to Google Container Registry, run:"
  echo "docker push $FULL_IMAGE_NAME"
  echo ""
  echo "To deploy to Cloud Run, run:"
  echo "gcloud run deploy fait-coop --image=$FULL_IMAGE_NAME --platform=managed --region=us-central1"
else
  echo "Build failed!"
fi
