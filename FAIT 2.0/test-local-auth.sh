#!/bin/bash

# Test Local Authentication
# This script runs the local authentication tests

# Set environment variables
export USE_LOCAL_AUTH=true

# Run the test script
echo "Testing local authentication..."
node --experimental-modules scripts/test-local-auth.js

# Check the exit code
if [ $? -eq 0 ]; then
  echo "✅ Local authentication tests passed!"
  exit 0
else
  echo "❌ Local authentication tests failed!"
  exit 1
fi
