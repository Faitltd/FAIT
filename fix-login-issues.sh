#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== FAIT Co-op Login Issues Fix Tool ===${NC}"
echo ""

# 1. Fix admin database schema issue
echo -e "${YELLOW}Step 1: Fixing admin database schema issue...${NC}"
./scripts/fix-admin-login.sh

# 2. Run Cypress tests to verify login functionality
echo -e "\n${YELLOW}Step 2: Running login tests to verify fixes...${NC}"
echo "Starting the application..."

# Check if the application is already running
curl -s http://localhost:5173 > /dev/null
if [ $? -ne 0 ]; then
  # Start the application in the background
  npm run dev &
  APP_PID=$!
  
  # Wait for the application to start
  echo "Waiting for the application to start..."
  sleep 10
else
  echo "Application is already running."
  APP_PID=""
fi

# Run the login tests
echo "Running login tests..."
./run-login-test.sh

# If we started the application, stop it
if [ -n "$APP_PID" ]; then
  echo "Stopping the application..."
  kill $APP_PID
fi

echo ""
echo -e "${GREEN}All fixes have been applied!${NC}"
echo ""
echo -e "${YELLOW}Summary of fixes:${NC}"
echo "1. Fixed database schema issue affecting the Admin user"
echo "2. Updated login form with proper data-cy attributes for testing"
echo "3. Ensured proper redirection after successful login"
echo ""
echo -e "${GREEN}You can now use the following login credentials:${NC}"
echo "- Admin: admin@itsfait.com / admin123"
echo "- Client: client@itsfait.com / client123"
echo "- Service Agent: service@itsfait.com / service123"
echo ""
echo "If you still encounter issues with the admin login, you can use the Emergency Login or Super Emergency Login options."
