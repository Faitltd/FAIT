#!/bin/bash

# Comprehensive Authentication Test Script
# This script runs the comprehensive authentication tests

# Start the development server in the background
echo "Starting development server..."
npm run dev &
DEV_PID=$!

# Wait for the server to start
echo "Waiting for development server to start..."
sleep 10

# Run the Cypress tests
echo "Running comprehensive authentication tests..."
npx cypress run --spec "cypress/e2e/auth-comprehensive.cy.js"
TEST_RESULT=$?

# Kill the development server
echo "Stopping development server..."
kill $DEV_PID

# Check the test result
if [ $TEST_RESULT -eq 0 ]; then
  echo "✅ Comprehensive authentication tests passed!"
  exit 0
else
  echo "❌ Comprehensive authentication tests failed!"
  exit 1
fi
