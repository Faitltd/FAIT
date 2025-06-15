#!/bin/bash

# This script helps verify a domain for Google Cloud

# Set variables
DOMAIN="itsfait.com"  # Replace with your actual domain

# Authenticate with Google Cloud (if not already authenticated)
echo "Authenticating with Google Cloud..."
gcloud auth login

# Add the domain to the verified domains
echo "Adding domain $DOMAIN to verified domains..."
gcloud domains verify $DOMAIN

echo "Follow the instructions to verify your domain."
echo "Once the domain is verified, you can run the setup-domain.sh script to map the domain to your Cloud Run service."
