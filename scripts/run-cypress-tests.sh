#!/bin/bash

# Script to run Cypress tests

# Start the development server in the background
echo "Starting development server..."
npm run dev &
DEV_SERVER_PID=$!

# Wait for the server to be ready
echo "Waiting for development server to be ready..."
npx wait-on http://localhost:5173

# Run Cypress tests
echo "Running Cypress tests..."
npx cypress run

# Store the exit code
EXIT_CODE=$?

# Kill the development server
echo "Shutting down development server..."
kill $DEV_SERVER_PID

# Exit with the Cypress exit code
exit $EXIT_CODE
