#!/bin/bash

# Start the development server in the background
echo "Starting development server..."
npm run dev &
SERVER_PID=$!

# Wait for the server to start
echo "Waiting for server to start..."
sleep 10

# Run Cypress tests
echo "Running Cypress tests..."
npx cypress run

# Capture the exit code of the Cypress tests
TEST_EXIT_CODE=$?

# Kill the development server
echo "Stopping development server..."
kill $SERVER_PID

# Exit with the same code as the tests
exit $TEST_EXIT_CODE
