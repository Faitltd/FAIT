#!/bin/bash

# Script to set up SSL certificates for the FAIT monorepo applications

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Default values
DOMAIN="fait.coop"
EMAIL="admin@fait.coop"
STAGING=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --domain=*)
      DOMAIN="${1#*=}"
      shift
      ;;
    --email=*)
      EMAIL="${1#*=}"
      shift
      ;;
    --staging)
      STAGING=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Usage: ./setup-ssl.sh [--domain=DOMAIN] [--email=EMAIL] [--staging]"
      exit 1
      ;;
  esac
done

# Create directories for SSL certificates
echo -e "${YELLOW}Creating directories for SSL certificates...${NC}"
mkdir -p nginx/ssl
mkdir -p nginx/www/.well-known/acme-challenge

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
  echo -e "${YELLOW}Installing certbot...${NC}"
  sudo apt-get update
  sudo apt-get install -y certbot
fi

# Generate SSL certificates
echo -e "${YELLOW}Generating SSL certificates for ${DOMAIN}...${NC}"

# Staging flag for testing
STAGING_FLAG=""
if [[ "$STAGING" == true ]]; then
  STAGING_FLAG="--staging"
fi

# Generate certificates for the main domain and subdomains
sudo certbot certonly $STAGING_FLAG \
  --webroot \
  --webroot-path=nginx/www \
  --email=$EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN \
  -d coop.$DOMAIN \
  -d offer.$DOMAIN \
  -d score.$DOMAIN \
  -d handy.$DOMAIN \
  -d flipper.$DOMAIN \
  -d remodel.$DOMAIN \
  -d scraper.$DOMAIN

# Copy certificates to nginx/ssl directory
echo -e "${YELLOW}Copying certificates to nginx/ssl directory...${NC}"
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/$DOMAIN.crt
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/$DOMAIN.key

# Set proper permissions
sudo chmod 644 nginx/ssl/$DOMAIN.crt
sudo chmod 600 nginx/ssl/$DOMAIN.key

# Create a cron job for automatic renewal
echo -e "${YELLOW}Setting up automatic renewal...${NC}"
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook \"cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $(pwd)/nginx/ssl/$DOMAIN.crt && cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $(pwd)/nginx/ssl/$DOMAIN.key\"") | crontab -

echo -e "${GREEN}SSL certificates have been set up successfully!${NC}"
