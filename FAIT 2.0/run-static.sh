#!/bin/bash

# Run the static server for FAIT 2.0

# Install required dependencies if not already installed
if ! npm list express >/dev/null 2>&1; then
  echo "Installing express..."
  npm install express
fi

# Start the static server
echo "Starting the static server..."
node static-server.js
