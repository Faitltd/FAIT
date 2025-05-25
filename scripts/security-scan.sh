#!/bin/bash

# This script performs security scanning on the application

# Set variables
PROJECT_ID="fait-444705"
SERVICE_NAME="fait-coop-main"
REGION="us-central1"

# Authenticate with Google Cloud (if not already authenticated)
echo "Authenticating with Google Cloud..."
gcloud auth login

# Set the project
echo "Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Scan for npm vulnerabilities
echo "Scanning for npm vulnerabilities..."
npm audit

# Scan Docker image for vulnerabilities
echo "Scanning Docker image for vulnerabilities..."
IMAGE_NAME="gcr.io/$PROJECT_ID/fait-coop-main:latest"
gcloud artifacts docker images scan $IMAGE_NAME --format="json" > security-scan-results.json

# Display summary of vulnerabilities
echo "Summary of vulnerabilities:"
jq '.vulnerabilities | group_by(.severity) | map({severity: .[0].severity, count: length}) | sort_by(.severity)' security-scan-results.json

# Check for critical vulnerabilities
CRITICAL_COUNT=$(jq '.vulnerabilities | map(select(.severity == "CRITICAL")) | length' security-scan-results.json)
if [ "$CRITICAL_COUNT" -gt 0 ]; then
  echo "WARNING: $CRITICAL_COUNT critical vulnerabilities found!"
  echo "Critical vulnerabilities:"
  jq '.vulnerabilities | map(select(.severity == "CRITICAL")) | map({name: .packageName, version: .packageVersion, description: .description})' security-scan-results.json
fi

# Check for high vulnerabilities
HIGH_COUNT=$(jq '.vulnerabilities | map(select(.severity == "HIGH")) | length' security-scan-results.json)
if [ "$HIGH_COUNT" -gt 0 ]; then
  echo "WARNING: $HIGH_COUNT high vulnerabilities found!"
  echo "High vulnerabilities:"
  jq '.vulnerabilities | map(select(.severity == "HIGH")) | map({name: .packageName, version: .packageVersion, description: .description})' security-scan-results.json
fi

echo "Security scan complete. Full results saved to security-scan-results.json"
