#!/bin/bash

# Test Authentication Credentials
# This script runs the authentication credentials test

# Set environment variables if needed
# export VITE_SUPABASE_URL=your_supabase_url
# export VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Run the test script
echo "Testing authentication credentials..."
node scripts/test-auth-credentials.cjs

# Check the exit code
if [ $? -eq 0 ]; then
  echo "✅ Authentication credentials test passed!"
  exit 0
else
  echo "❌ Authentication credentials test failed!"
  exit 1
fi
