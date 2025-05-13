#!/bin/bash

# Script to deploy applications from the monorepo to Google Cloud Run

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Default values
PROJECT_ID="fait-444705"
REGION="us-central1"
ENVIRONMENT="prod"
APP_NAME=""
ALL_APPS=false
REGISTRY="gcr.io"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --project=*)
      PROJECT_ID="${1#*=}"
      shift
      ;;
    --region=*)
      REGION="${1#*=}"
      shift
      ;;
    --env=*)
      ENVIRONMENT="${1#*=}"
      shift
      ;;
    --app=*)
      APP_NAME="${1#*=}"
      shift
      ;;
    --all)
      ALL_APPS=true
      shift
      ;;
    --registry=*)
      REGISTRY="${1#*=}"
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Usage: ./deploy-to-cloudrun.sh [--project=PROJECT_ID] [--region=REGION] [--env=ENVIRONMENT] [--app=APP_NAME | --all] [--registry=REGISTRY]"
      exit 1
      ;;
  esac
done

# Validate arguments
if [[ "$ALL_APPS" == false && -z "$APP_NAME" ]]; then
  echo -e "${RED}Error: Either --app or --all must be specified${NC}"
  echo "Usage: ./deploy-to-cloudrun.sh [--project=PROJECT_ID] [--region=REGION] [--env=ENVIRONMENT] [--app=APP_NAME | --all] [--registry=REGISTRY]"
  exit 1
fi

# Function to deploy a single app
deploy_app() {
  local app=$1
  local service_name="${ENVIRONMENT}-${app}"
  local image_name="${REGISTRY}/${PROJECT_ID}/${service_name}:latest"
  
  echo -e "${YELLOW}Building Docker image for ${app}...${NC}"
  docker build -t $image_name -f apps/$app/Dockerfile .
  
  echo -e "${YELLOW}Pushing image to container registry...${NC}"
  docker push $image_name
  
  echo -e "${YELLOW}Deploying ${app} to Cloud Run...${NC}"
  gcloud run deploy $service_name \
    --image $image_name \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars="NODE_ENV=production"
  
  # Get the URL of the deployed service
  local url=$(gcloud run services describe $service_name --platform managed --region $REGION --format="value(status.url)")
  echo -e "${GREEN}${app} deployed successfully to ${url}${NC}"
}

# Deploy all apps or a specific app
if [[ "$ALL_APPS" == true ]]; then
  echo -e "${YELLOW}Deploying all applications to Cloud Run...${NC}"
  
  # Get all app directories
  apps=$(ls -d apps/*/ | cut -d'/' -f2)
  
  for app in $apps; do
    deploy_app $app
  done
  
  echo -e "${GREEN}All applications deployed successfully!${NC}"
else
  echo -e "${YELLOW}Deploying ${APP_NAME} to Cloud Run...${NC}"
  deploy_app $APP_NAME
fi
