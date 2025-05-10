#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== FAIT Co-op Super Emergency Login Test Runner ===${NC}"
echo ""

# Check if the server is already running
echo -e "${YELLOW}Checking if the development server is already running...${NC}"
if curl -s http://localhost:5173 > /dev/null; then
  echo -e "${GREEN}Development server is already running at http://localhost:5173${NC}"
  SERVER_RUNNING=true
else
  echo -e "${YELLOW}Starting development server...${NC}"
  # Start the development server in the background
  npm run dev &
  SERVER_PID=$!
  SERVER_RUNNING=false
  
  # Wait for the server to start
  echo -e "${YELLOW}Waiting for the server to start...${NC}"
  for i in {1..30}; do
    if curl -s http://localhost:5173 > /dev/null; then
      echo -e "${GREEN}Development server started successfully!${NC}"
      break
    fi
    
    if [ $i -eq 30 ]; then
      echo -e "${RED}Failed to start development server after 30 seconds.${NC}"
      if [ "$SERVER_RUNNING" = false ] && [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID
      fi
      exit 1
    fi
    
    echo -n "."
    sleep 1
  done
  echo ""
fi

# Run only the super emergency login test
echo -e "${YELLOW}Running super emergency login test...${NC}"
npx cypress run --spec "cypress/e2e/super-emergency-login-test.cy.js"

# Capture the exit code
TEST_EXIT_CODE=$?

# If we started the server, shut it down
if [ "$SERVER_RUNNING" = false ] && [ ! -z "$SERVER_PID" ]; then
  echo -e "${YELLOW}Shutting down development server...${NC}"
  kill $SERVER_PID
  wait $SERVER_PID 2>/dev/null
  echo -e "${GREEN}Development server stopped.${NC}"
fi

# Exit with the test exit code
echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}Super emergency login tests passed!${NC}"
  echo -e "${GREEN}The login credentials are working correctly with super emergency login.${NC}"
else
  echo -e "${RED}Super emergency login tests failed.${NC}"
  echo -e "${YELLOW}Check the test results and screenshots for details.${NC}"
fi

exit $TEST_EXIT_CODE
