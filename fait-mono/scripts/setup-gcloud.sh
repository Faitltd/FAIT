#!/bin/bash

# Script to set up Google Cloud for the FAIT monorepo applications

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Default values
PROJECT_ID="fait-444705"
REGION="us-central1"
BILLING_ACCOUNT=""

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
    --billing=*)
      BILLING_ACCOUNT="${1#*=}"
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Usage: ./setup-gcloud.sh [--project=PROJECT_ID] [--region=REGION] [--billing=BILLING_ACCOUNT]"
      exit 1
      ;;
  esac
done

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo -e "${RED}Error: gcloud CLI is not installed. Please install it first.${NC}"
  exit 1
fi

# Check if the user is logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
  echo -e "${YELLOW}You need to log in to Google Cloud first.${NC}"
  gcloud auth login
fi

# Create a new project if it doesn't exist
if ! gcloud projects describe $PROJECT_ID &> /dev/null; then
  echo -e "${YELLOW}Creating a new project: $PROJECT_ID...${NC}"
  gcloud projects create $PROJECT_ID
  
  # Set the billing account if provided
  if [[ -n "$BILLING_ACCOUNT" ]]; then
    echo -e "${YELLOW}Setting up billing account...${NC}"
    gcloud billing projects link $PROJECT_ID --billing-account=$BILLING_ACCOUNT
  else
    echo -e "${YELLOW}No billing account provided. Please set up billing manually.${NC}"
  fi
else
  echo -e "${YELLOW}Project $PROJECT_ID already exists.${NC}"
fi

# Set the default project
echo -e "${YELLOW}Setting $PROJECT_ID as the default project...${NC}"
gcloud config set project $PROJECT_ID

# Set the default region
echo -e "${YELLOW}Setting $REGION as the default region...${NC}"
gcloud config set run/region $REGION

# Enable required APIs
echo -e "${YELLOW}Enabling required APIs...${NC}"
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable iam.googleapis.com
gcloud services enable compute.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudscheduler.googleapis.com

# Create service account for deployment
echo -e "${YELLOW}Creating service account for deployment...${NC}"
gcloud iam service-accounts create github-actions-deployer \
  --display-name="GitHub Actions Deployer"

# Grant necessary permissions to the service account
echo -e "${YELLOW}Granting necessary permissions to the service account...${NC}"
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deployer@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create and download a key for the service account
echo -e "${YELLOW}Creating and downloading a key for the service account...${NC}"
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions-deployer@$PROJECT_ID.iam.gserviceaccount.com

echo -e "${GREEN}Google Cloud setup completed successfully!${NC}"
echo -e "${YELLOW}Please add the contents of github-actions-key.json as a secret named GCP_SA_KEY in your GitHub repository.${NC}"
