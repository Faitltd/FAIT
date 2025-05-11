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

print_header "FAIT Co-op CI Cypress Testing"

# Check if running in CI environment
if [ -n "$CI" ]; then
  echo -e "${YELLOW}Running in CI environment${NC}"
else
  echo -e "${YELLOW}Running in local environment${NC}"
fi

# Create results directory
mkdir -p cypress/results

# Check if specific tests were requested
if [ $# -gt 0 ]; then
  TEST_SPECS="$@"
  echo -e "${YELLOW}Running specific tests: ${TEST_SPECS}${NC}"
else
  # Default test for CI
  TEST_SPECS="basic"
  echo -e "${YELLOW}Running default CI tests: ${TEST_SPECS}${NC}"
fi

# Start the development server in the background
echo -e "${YELLOW}Starting development server...${NC}"
npm run dev &
SERVER_PID=$!

# Wait for the server to start
echo -e "${YELLOW}Waiting for the server to start...${NC}"
for i in {1..30}; do
  if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}Development server started successfully!${NC}"
    break
  fi
  
  if [ $i -eq 30 ]; then
    echo -e "${RED}Failed to start development server after 30 seconds.${NC}"
    if [ ! -z "$SERVER_PID" ]; then
      kill $SERVER_PID
    fi
    exit 1
  fi
  
  echo -n "."
  sleep 1
done
echo ""

# Run tests based on categories
ALL_PASSED=true

for category in $TEST_SPECS; do
  case "$category" in
    basic)
      print_header "Running Basic Tests"
      SPEC_FILES="cypress/e2e/basic-test.cy.js"
      ;;
    auth)
      print_header "Running Authentication Tests"
      SPEC_FILES="cypress/e2e/login-credentials.cy.js,cypress/e2e/login-flow.cy.js"
      ;;
    navigation)
      print_header "Running Navigation Tests"
      SPEC_FILES="cypress/e2e/app-navigation.cy.js,cypress/e2e/navigation-flow.cy.js"
      ;;
    features)
      print_header "Running Feature Tests"
      SPEC_FILES="cypress/e2e/project-management.cy.js,cypress/e2e/service-agent.cy.js"
      ;;
    all)
      print_header "Running All Tests"
      SPEC_FILES="cypress/e2e/**/*.cy.js"
      ;;
    *)
      # If it's not a category, assume it's a specific test file
      SPEC_FILES="$category"
      ;;
  esac

  echo -e "${YELLOW}Running tests: ${SPEC_FILES}${NC}"
  
  # Run the tests in headless mode
  npx cypress run --spec "$SPEC_FILES" --browser chrome
  
  # Check if tests passed
  if [ $? -ne 0 ]; then
    ALL_PASSED=false
    echo -e "${RED}Some tests in category '$category' failed.${NC}"
  else
    echo -e "${GREEN}All tests in category '$category' passed!${NC}"
  fi
done

# Shut down the server
echo -e "${YELLOW}Shutting down development server...${NC}"
kill $SERVER_PID
wait $SERVER_PID 2>/dev/null
echo -e "${GREEN}Development server stopped.${NC}"

# Final results
print_header "Test Results Summary"

if [ "$ALL_PASSED" = true ]; then
  echo -e "${GREEN}${BOLD}All tests passed successfully!${NC}"
  exit 0
else
  echo -e "${RED}${BOLD}Some tests failed. Check the test results for details.${NC}"
  exit 1
fi
