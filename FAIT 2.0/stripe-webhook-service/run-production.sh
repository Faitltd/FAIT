#!/bin/bash

# Exit on error
set -e

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ "$1" == "--install" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Create logs directory if it doesn't exist
if [ ! -d "logs" ]; then
  echo "Creating logs directory..."
  mkdir -p logs
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
  echo "Warning: .env file not found. Using environment variables."
fi

# Run the production version of the server
echo "Starting production server..."
NODE_ENV=production node index.production.js
