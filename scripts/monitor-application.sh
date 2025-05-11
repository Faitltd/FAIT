#!/bin/bash

# This script helps monitor the FAIT Co-op application after deployment
#
# Prerequisites:
# - Google Cloud CLI installed and configured
#
# Usage:
# ./scripts/monitor-application.sh your-domain.com

# Set text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Configuration
SERVICE_NAME="fait-coop"
REGION="us-central1"

# Check if domain argument is provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: Domain name is required.${NC}"
  echo -e "Usage: ./scripts/monitor-application.sh your-domain.com"
  exit 1
fi

DOMAIN=$1

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo -e "${RED}Error: Google Cloud CLI (gcloud) is not installed.${NC}"
  echo -e "Please install it from: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# Check if the user is logged in to gcloud
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
  echo -e "${RED}Error: You are not logged in to Google Cloud.${NC}"
  echo -e "Please run: gcloud auth login"
  exit 1
fi

# Function to check domain status
check_domain_status() {
  echo -e "${YELLOW}Checking domain status...${NC}"
  ./scripts/check-domain-status.sh $DOMAIN
}

# Function to check Cloud Run service status
check_service_status() {
  echo -e "${YELLOW}Checking Cloud Run service status...${NC}"
  gcloud run services describe $SERVICE_NAME --region=$REGION --format="yaml(status)"
}

# Function to check recent logs
check_logs() {
  echo -e "${YELLOW}Checking recent logs...${NC}"
  gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" --limit=20 --format="table(timestamp,severity,textPayload)"
}

# Function to check error logs
check_error_logs() {
  echo -e "${YELLOW}Checking error logs...${NC}"
  gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME AND severity>=ERROR" --limit=20 --format="table(timestamp,severity,textPayload)"
}

# Function to check domain health
check_domain_health() {
  echo -e "${YELLOW}Checking domain health...${NC}"
  
  # Check if the domain is accessible
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN)
  
  if [[ $HTTP_STATUS -ge 200 && $HTTP_STATUS -lt 300 ]]; then
    echo -e "${GREEN}Domain is accessible (HTTP $HTTP_STATUS)${NC}"
  else
    echo -e "${RED}Domain is not accessible (HTTP $HTTP_STATUS)${NC}"
    echo -e "This could be due to:"
    echo -e "1. DNS propagation is still in progress"
    echo -e "2. SSL certificate is not yet active"
    echo -e "3. Application is not running correctly"
  fi
  
  # Check SSL certificate
  SSL_EXPIRY=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null)
  
  if [ -n "$SSL_EXPIRY" ]; then
    echo -e "${GREEN}SSL certificate is valid${NC}"
    echo -e "Expiry: $SSL_EXPIRY"
  else
    echo -e "${RED}SSL certificate is not valid or not yet active${NC}"
  fi
}

# Main menu
while true; do
  echo -e "\n${YELLOW}FAIT Co-op Application Monitoring${NC}"
  echo -e "Domain: $DOMAIN"
  echo -e "Service: $SERVICE_NAME"
  echo -e "Region: $REGION"
  echo -e "\nSelect an option:"
  echo -e "1. Check domain status"
  echo -e "2. Check Cloud Run service status"
  echo -e "3. Check recent logs"
  echo -e "4. Check error logs"
  echo -e "5. Check domain health"
  echo -e "6. Run all checks"
  echo -e "7. Exit"
  
  read -r OPTION
  
  case $OPTION in
    1) check_domain_status ;;
    2) check_service_status ;;
    3) check_logs ;;
    4) check_error_logs ;;
    5) check_domain_health ;;
    6)
      check_domain_status
      check_service_status
      check_error_logs
      check_domain_health
      ;;
    7) exit 0 ;;
    *) echo -e "${RED}Invalid option${NC}" ;;
  esac
  
  echo -e "\nPress Enter to continue..."
  read
done
