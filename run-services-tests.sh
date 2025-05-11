#!/bin/bash

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Running services page tests...${NC}"

# Check if a server is already running on port 5173 or 5174
if nc -z localhost 5173 2>/dev/null || nc -z localhost 5174 2>/dev/null; then
  echo -e "${YELLOW}Development server already running, using existing server...${NC}"
  SERVER_RUNNING=true
else
  # Start the development server in the background
  echo -e "${YELLOW}Starting development server...${NC}"
  npm run dev &
  SERVER_PID=$!
  SERVER_RUNNING=false

  # Wait for the server to start
  echo -e "${YELLOW}Waiting for server to start...${NC}"
  sleep 15
fi

# Function to run a test with retry logic
run_test() {
  local test_file=$1
  local test_name=$2
  local max_retries=2
  local retry=0
  local success=false

  echo -e "${BLUE}Running ${test_name}...${NC}"

  while [ $retry -le $max_retries ] && [ "$success" = false ]; do
    if [ $retry -gt 0 ]; then
      echo -e "${YELLOW}Retry attempt $retry for ${test_name}...${NC}"
    fi

    npx cypress run --spec "$test_file"

    if [ $? -eq 0 ]; then
      success=true
      echo -e "${GREEN}${test_name} passed!${NC}"
    else
      retry=$((retry+1))
      if [ $retry -le $max_retries ]; then
        echo -e "${YELLOW}${test_name} failed, waiting before retry...${NC}"
        sleep 5
      else
        echo -e "${RED}${test_name} failed after $max_retries retries.${NC}"
      fi
    fi
  done
}

# Run the tests with retry logic
run_test "cypress/e2e/debug-services-page.cy.js" "Test debug page test"
run_test "cypress/e2e/resilient-services-test.cy.js" "Resilient services test"
run_test "cypress/e2e/google-maps-integration.cy.js" "Google Maps integration test"

# Kill the development server only if we started it
if [ "$SERVER_RUNNING" = false ] && [ ! -z "$SERVER_PID" ]; then
  echo -e "${YELLOW}Stopping development server...${NC}"
  kill $SERVER_PID
else
  echo -e "${YELLOW}Leaving existing development server running...${NC}"
fi

echo -e "${GREEN}All tests completed!${NC}"

# Print a summary of the test results
echo -e "${BLUE}Test Summary:${NC}"
echo -e "${BLUE}=============${NC}"
echo -e "Check the Cypress screenshots directory for visual verification:"
echo -e "cypress/screenshots/"
echo -e "${BLUE}=============${NC}"
echo -e "${GREEN}If you need to debug further, try running the tests in interactive mode:${NC}"
echo -e "npx cypress open"
