#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}FAIT Co-op App Testing Script${NC}"
echo -e "${YELLOW}This script will start the development server and run Cypress tests${NC}"

# Check if port is provided as an argument, default to 5173
PORT=${1:-5173}

# Start the development server in the background
echo -e "${GREEN}Starting Vite development server on port $PORT...${NC}"
npx vite --port $PORT &
SERVER_PID=$!

# Wait for the server to start
echo -e "${YELLOW}Waiting for server to start...${NC}"
sleep 5

# Run the Cypress tests
echo -e "${GREEN}Running Cypress tests...${NC}"
npx cypress run --spec "cypress/e2e/app-versions.cy.js"
TEST_RESULT=$?

# Kill the server
echo -e "${YELLOW}Stopping the server...${NC}"
kill $SERVER_PID

# Exit with the test result
if [ $TEST_RESULT -eq 0 ]; then
  echo -e "${GREEN}Tests passed!${NC}"
else
  echo -e "${RED}Tests failed!${NC}"
fi

exit $TEST_RESULT
