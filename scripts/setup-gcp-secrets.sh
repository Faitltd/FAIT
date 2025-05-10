#!/bin/bash

# This script sets up Google Secret Manager secrets for the FAIT Co-op platform
#
# Prerequisites:
# - Google Cloud CLI installed and configured
# - Appropriate permissions to create secrets
#
# Usage:
# ./scripts/setup-gcp-secrets.sh

# Set text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="fait-444705"  # Your GCP project ID
REGION="us-central1"      # Your preferred region
SERVICE_ACCOUNT="fait-coop-sa@${PROJECT_ID}.iam.gserviceaccount.com"  # Your service account

# Load environment variables from .env file
if [ -f .env ]; then
  echo -e "${YELLOW}Loading environment variables from .env file...${NC}"
  export $(grep -v '^#' .env | xargs)
else
  echo -e "${RED}Error: .env file not found.${NC}"
  exit 1
fi

# Check if required environment variables are set
if [ -z "$SUPABASE_SERVICE_KEY" ] || [ -z "$JWT_SECRET" ] || [ -z "$STRIPE_SECRET_KEY" ]; then
  echo -e "${RED}Error: Required environment variables are not set.${NC}"
  echo "Please ensure SUPABASE_SERVICE_KEY, JWT_SECRET, and STRIPE_SECRET_KEY are set in your .env file."
  exit 1
fi

# Create secrets
echo -e "${YELLOW}Creating secrets in Google Secret Manager...${NC}"

# Create SUPABASE_SERVICE_KEY secret
echo -e "${YELLOW}Creating SUPABASE_SERVICE_KEY secret...${NC}"
echo -n "$SUPABASE_SERVICE_KEY" | gcloud secrets create supabase-service-key \
  --project=$PROJECT_ID \
  --replication-policy="automatic" \
  --data-file=- \
  || echo -e "${YELLOW}Secret supabase-service-key already exists, updating...${NC}" \
  && echo -n "$SUPABASE_SERVICE_KEY" | gcloud secrets versions add supabase-service-key \
  --project=$PROJECT_ID \
  --data-file=-

# Create JWT_SECRET secret
echo -e "${YELLOW}Creating JWT_SECRET secret...${NC}"
echo -n "$JWT_SECRET" | gcloud secrets create jwt-secret \
  --project=$PROJECT_ID \
  --replication-policy="automatic" \
  --data-file=- \
  || echo -e "${YELLOW}Secret jwt-secret already exists, updating...${NC}" \
  && echo -n "$JWT_SECRET" | gcloud secrets versions add jwt-secret \
  --project=$PROJECT_ID \
  --data-file=-

# Create STRIPE_SECRET_KEY secret
echo -e "${YELLOW}Creating STRIPE_SECRET_KEY secret...${NC}"
echo -n "$STRIPE_SECRET_KEY" | gcloud secrets create stripe-secret-key \
  --project=$PROJECT_ID \
  --replication-policy="automatic" \
  --data-file=- \
  || echo -e "${YELLOW}Secret stripe-secret-key already exists, updating...${NC}" \
  && echo -n "$STRIPE_SECRET_KEY" | gcloud secrets versions add stripe-secret-key \
  --project=$PROJECT_ID \
  --data-file=-

# Grant access to the service account
echo -e "${YELLOW}Granting access to service account...${NC}"

# Check if service account exists, create if it doesn't
gcloud iam service-accounts describe $SERVICE_ACCOUNT --project=$PROJECT_ID > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Service account does not exist, creating...${NC}"
  gcloud iam service-accounts create fait-coop-sa \
    --project=$PROJECT_ID \
    --display-name="FAIT Co-op Service Account"
fi

# Grant access to secrets
echo -e "${YELLOW}Granting access to secrets...${NC}"
for SECRET_NAME in supabase-service-key jwt-secret stripe-secret-key; do
  gcloud secrets add-iam-policy-binding $SECRET_NAME \
    --project=$PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"
done

echo -e "${GREEN}Secrets setup complete!${NC}"
echo -e "The following secrets have been created and configured:"
echo -e "  - supabase-service-key"
echo -e "  - jwt-secret"
echo -e "  - stripe-secret-key"
echo -e "Service account $SERVICE_ACCOUNT has been granted access to these secrets."
