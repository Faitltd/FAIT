#!/bin/bash

# Exit on any error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="fait-444705"  # Your GCP project ID
TRIGGER_ID="472ecbb0-ea13-41d1-820b-8ab9b0fd8bae"  # Your trigger ID

echo -e "${YELLOW}Updating Cloud Build trigger to use CLOUD_LOGGING_ONLY...${NC}"

# Update the trigger to use CLOUD_LOGGING_ONLY
gcloud builds triggers update $TRIGGER_ID \
  --project=$PROJECT_ID \
  --log-type=CLOUD_LOGGING_ONLY

echo -e "${GREEN}Trigger updated successfully!${NC}"
echo -e "You can now push a new commit to trigger a build, or manually trigger a build from the Cloud Console."
