#!/bin/bash

# Run the development server for FAIT 2.0

# Install required dependencies if not already installed
if ! npm list express >/dev/null 2>&1; then
  echo "Installing express..."
  npm install express
fi

if ! npm list vite >/dev/null 2>&1; then
  echo "Installing vite..."
  npm install vite
fi

# Start the development server
echo "Starting the development server..."
node dev-server.js
