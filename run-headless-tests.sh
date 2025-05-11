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

print_header "FAIT Co-op Headless Cypress Testing"

# Check if specific tests were requested
if [ $# -gt 0 ]; then
  TEST_SPECS="$@"
  echo -e "${YELLOW}Running specific tests: ${TEST_SPECS}${NC}"
else
  # Default test categories
  TEST_SPECS="basic auth navigation features"
  echo -e "${YELLOW}Running default test categories: ${TEST_SPECS}${NC}"
fi

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

# Run tests based on categories
ALL_PASSED=true

for category in $TEST_SPECS; do
  case "$category" in
    basic)
      print_header "Running Basic Tests"
      SPEC_FILES="cypress/e2e/app-running.cy.js,cypress/e2e/basic-test.cy.js,cypress/e2e/simple-test-app.cy.js"
      ;;
    auth)
      print_header "Running Authentication Tests"
      SPEC_FILES="cypress/e2e/login-credentials.cy.js,cypress/e2e/login-flow.cy.js,cypress/e2e/auth-flow.cy.js,cypress/e2e/simple-login.cy.js"
      ;;
    navigation)
      print_header "Running Navigation Tests"
      SPEC_FILES="cypress/e2e/app-navigation.cy.js,cypress/e2e/navigation-flow.cy.js,cypress/e2e/homepage-links.cy.js"
      ;;
    features)
      print_header "Running Feature Tests"
      SPEC_FILES="cypress/e2e/project-management.cy.js,cypress/e2e/service-agent.cy.js,cypress/e2e/client-dashboard.cy.js,cypress/e2e/calculator-page.cy.js"
      ;;
    visual)
      print_header "Running Visual Tests"
      SPEC_FILES="cypress/e2e/visual-testing.cy.js,cypress/e2e/responsive-design.cy.js"
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
  
  # Fix any Cypress configuration conflicts first
  npm run cypress:fix
  
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

# If we started the server, shut it down
if [ "$SERVER_RUNNING" = false ] && [ ! -z "$SERVER_PID" ]; then
  echo -e "${YELLOW}Shutting down development server...${NC}"
  kill $SERVER_PID
  wait $SERVER_PID 2>/dev/null
  echo -e "${GREEN}Development server stopped.${NC}"
fi

# Final results
print_header "Test Results Summary"

if [ "$ALL_PASSED" = true ]; then
  echo -e "${GREEN}${BOLD}All tests passed successfully!${NC}"
  exit 0
else
  echo -e "${RED}${BOLD}Some tests failed. Check the test results for details.${NC}"
  echo -e "${YELLOW}Test results are available in the cypress/results directory.${NC}"
  exit 1
fi
