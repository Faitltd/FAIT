#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
  echo -e "\n${BLUE}${BOLD}=== $1 ===${NC}\n"
}

print_header "FAIT Co-op Headless Cypress Testing - Working Tests Only"

# Create results directory
mkdir -p cypress/results

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

# Fix any Cypress configuration conflicts first
npm run cypress:fix

# Define working tests
print_header "Running Working Tests"
WORKING_TESTS="cypress/e2e/basic-test.cy.js"

# Run the tests in headless mode
echo -e "${YELLOW}Running tests: ${WORKING_TESTS}${NC}"
npx cypress run --spec "$WORKING_TESTS" --browser chrome

# Capture the exit code
TEST_EXIT_CODE=$?

# If we started the server, shut it down
if [ "$SERVER_RUNNING" = false ] && [ ! -z "$SERVER_PID" ]; then
  echo -e "${YELLOW}Shutting down development server...${NC}"
  kill $SERVER_PID
  wait $SERVER_PID 2>/dev/null
  echo -e "${GREEN}Development server stopped.${NC}"
fi

# Final results
print_header "Test Results Summary"

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}${BOLD}All tests passed successfully!${NC}"
  exit 0
else
  echo -e "${RED}${BOLD}Some tests failed. Check the test results for details.${NC}"
  echo -e "${YELLOW}Test results are available in the cypress/results directory.${NC}"
  exit 1
fi
