#!/bin/bash

# Build and serve the FAIT 2.0 application

# Build the application
echo "Building the application..."
npm run build

# Check if the build was successful
if [ $? -ne 0 ]; then
  echo "Build failed. Please fix the errors and try again."
  exit 1
fi

# Install express if not already installed
if ! npm list express >/dev/null 2>&1; then
  echo "Installing express..."
  npm install express
fi

# Start the server
echo "Starting the server..."
node server.js
