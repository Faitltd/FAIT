#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Running Fixed Cypress Tests${NC}"
echo -e "${GREEN}=========================================${NC}"

# Create test results directory
mkdir -p cypress/results

# Start the development server in the background
echo -e "${YELLOW}Starting development server...${NC}"
npm run dev &
DEV_SERVER_PID=$!

# Wait for the server to start
echo -e "${YELLOW}Waiting for server to start...${NC}"
sleep 10

# Run the fixed tests
echo -e "${GREEN}Running fixed login tests...${NC}"
npx cypress run --spec "cypress/e2e/fixed-login-test.cy.js" --browser chrome

# Check if tests passed
LOGIN_RESULT=$?
if [ $LOGIN_RESULT -eq 0 ]; then
  echo -e "${GREEN}Login tests passed!${NC}"
else
  echo -e "${RED}Login tests failed. Check the test results for details.${NC}"
fi

# Run basic tests
echo -e "${GREEN}Running basic tests...${NC}"
npx cypress run --spec "cypress/e2e/basic-test.cy.js" --browser chrome

# Check if tests passed
BASIC_RESULT=$?
if [ $BASIC_RESULT -eq 0 ]; then
  echo -e "${GREEN}Basic tests passed!${NC}"
else
  echo -e "${RED}Basic tests failed. Check the test results for details.${NC}"
fi

# Run navigation tests
echo -e "${GREEN}Running navigation tests...${NC}"
npx cypress run --spec "cypress/e2e/fixed-navigation-test.cy.js" --browser chrome

# Check if tests passed
NAVIGATION_RESULT=$?
if [ $NAVIGATION_RESULT -eq 0 ]; then
  echo -e "${GREEN}Navigation tests passed!${NC}"
else
  echo -e "${RED}Navigation tests failed. Check the test results for details.${NC}"
fi

# Run dashboard tests
echo -e "${GREEN}Running dashboard tests...${NC}"
npx cypress run --spec "cypress/e2e/fixed-dashboard-test.cy.js" --browser chrome

# Check if tests passed
DASHBOARD_RESULT=$?
if [ $DASHBOARD_RESULT -eq 0 ]; then
  echo -e "${GREEN}Dashboard tests passed!${NC}"
else
  echo -e "${RED}Dashboard tests failed. Check the test results for details.${NC}"
fi

# Run client features tests
echo -e "${GREEN}Running client features tests...${NC}"
npx cypress run --spec "cypress/e2e/fixed-client-features.cy.js" --browser chrome

# Check if tests passed
CLIENT_RESULT=$?
if [ $CLIENT_RESULT -eq 0 ]; then
  echo -e "${GREEN}Client features tests passed!${NC}"
else
  echo -e "${RED}Client features tests failed. Check the test results for details.${NC}"
fi

# Run service agent features tests
echo -e "${GREEN}Running service agent features tests...${NC}"
npx cypress run --spec "cypress/e2e/fixed-service-agent-features.cy.js" --browser chrome

# Check if tests passed
SERVICE_RESULT=$?
if [ $SERVICE_RESULT -eq 0 ]; then
  echo -e "${GREEN}Service agent features tests passed!${NC}"
else
  echo -e "${RED}Service agent features tests failed. Check the test results for details.${NC}"
fi

# Run booking tests
echo -e "${GREEN}Running booking tests...${NC}"
npx cypress run --spec "cypress/e2e/fixed-booking-test.cy.js" --browser chrome

# Check if tests passed
BOOKING_RESULT=$?
if [ $BOOKING_RESULT -eq 0 ]; then
  echo -e "${GREEN}Booking tests passed!${NC}"
else
  echo -e "${RED}Booking tests failed. Check the test results for details.${NC}"
fi

# Run messaging tests
echo -e "${GREEN}Running messaging tests...${NC}"
npx cypress run --spec "cypress/e2e/fixed-messaging-test.cy.js" --browser chrome

# Check if tests passed
MESSAGING_RESULT=$?
if [ $MESSAGING_RESULT -eq 0 ]; then
  echo -e "${GREEN}Messaging tests passed!${NC}"
else
  echo -e "${RED}Messaging tests failed. Check the test results for details.${NC}"
fi

# Run project tests
echo -e "${GREEN}Running project tests...${NC}"
npx cypress run --spec "cypress/e2e/fixed-project-test.cy.js" --browser chrome

# Check if tests passed
PROJECT_RESULT=$?
if [ $PROJECT_RESULT -eq 0 ]; then
  echo -e "${GREEN}Project tests passed!${NC}"
else
  echo -e "${RED}Project tests failed. Check the test results for details.${NC}"
fi

# Run visual tests
echo -e "${GREEN}Running visual tests...${NC}"
npx cypress run --spec "cypress/e2e/fixed-visual-test.cy.js" --browser chrome

# Check if tests passed
VISUAL_RESULT=$?
if [ $VISUAL_RESULT -eq 0 ]; then
  echo -e "${GREEN}Visual tests passed!${NC}"
else
  echo -e "${RED}Visual tests failed. Check the test results for details.${NC}"
fi

# Run test data management tests
echo -e "${GREEN}Running test data management tests...${NC}"
npx cypress run --spec "cypress/e2e/fixed-test-data-management.cy.js" --browser chrome

# Check if tests passed
DATA_RESULT=$?
if [ $DATA_RESULT -eq 0 ]; then
  echo -e "${GREEN}Test data management tests passed!${NC}"
else
  echo -e "${RED}Test data management tests failed. Check the test results for details.${NC}"
fi

# Run features tests if they exist
if [ -f "cypress/e2e/features-test.cy.js" ]; then
  echo -e "${GREEN}Running features tests...${NC}"
  npx cypress run --spec "cypress/e2e/features-test.cy.js" --browser chrome

  # Check if tests passed
  FEATURES_RESULT=$?
  if [ $FEATURES_RESULT -eq 0 ]; then
    echo -e "${GREEN}Features tests passed!${NC}"
  else
    echo -e "${RED}Features tests failed. Check the test results for details.${NC}"
  fi
else
  echo -e "${YELLOW}Features tests not found, skipping...${NC}"
  FEATURES_RESULT=0
fi

# Kill the development server
echo -e "${YELLOW}Stopping development server...${NC}"
kill $DEV_SERVER_PID

# Print summary
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Test Summary${NC}"
echo -e "${GREEN}=========================================${NC}"
echo -e "Login Tests: $([ $LOGIN_RESULT -eq 0 ] && echo "${GREEN}PASSED${NC}" || echo "${RED}FAILED${NC}")"
echo -e "Basic Tests: $([ $BASIC_RESULT -eq 0 ] && echo "${GREEN}PASSED${NC}" || echo "${RED}FAILED${NC}")"
echo -e "Navigation Tests: $([ $NAVIGATION_RESULT -eq 0 ] && echo "${GREEN}PASSED${NC}" || echo "${RED}FAILED${NC}")"
echo -e "Dashboard Tests: $([ $DASHBOARD_RESULT -eq 0 ] && echo "${GREEN}PASSED${NC}" || echo "${RED}FAILED${NC}")"
echo -e "Client Features Tests: $([ $CLIENT_RESULT -eq 0 ] && echo "${GREEN}PASSED${NC}" || echo "${RED}FAILED${NC}")"
echo -e "Service Agent Features Tests: $([ $SERVICE_RESULT -eq 0 ] && echo "${GREEN}PASSED${NC}" || echo "${RED}FAILED${NC}")"
echo -e "Booking Tests: $([ $BOOKING_RESULT -eq 0 ] && echo "${GREEN}PASSED${NC}" || echo "${RED}FAILED${NC}")"
echo -e "Messaging Tests: $([ $MESSAGING_RESULT -eq 0 ] && echo "${GREEN}PASSED${NC}" || echo "${RED}FAILED${NC}")"
echo -e "Project Tests: $([ $PROJECT_RESULT -eq 0 ] && echo "${GREEN}PASSED${NC}" || echo "${RED}FAILED${NC}")"
echo -e "Visual Tests: $([ $VISUAL_RESULT -eq 0 ] && echo "${GREEN}PASSED${NC}" || echo "${RED}FAILED${NC}")"
echo -e "Test Data Management Tests: $([ $DATA_RESULT -eq 0 ] && echo "${GREEN}PASSED${NC}" || echo "${RED}FAILED${NC}")"
if [ -f "cypress/e2e/features-test.cy.js" ]; then
  echo -e "Features Tests: $([ $FEATURES_RESULT -eq 0 ] && echo "${GREEN}PASSED${NC}" || echo "${RED}FAILED${NC}")"
fi

# Set exit code based on test results
if [ $LOGIN_RESULT -eq 0 ] && [ $BASIC_RESULT -eq 0 ] && [ $NAVIGATION_RESULT -eq 0 ] && [ $DASHBOARD_RESULT -eq 0 ] && [ $CLIENT_RESULT -eq 0 ] && [ $SERVICE_RESULT -eq 0 ] && [ $BOOKING_RESULT -eq 0 ] && [ $MESSAGING_RESULT -eq 0 ] && [ $PROJECT_RESULT -eq 0 ] && [ $VISUAL_RESULT -eq 0 ] && [ $DATA_RESULT -eq 0 ] && [ $FEATURES_RESULT -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed. Check the test results for details.${NC}"
  exit 1
fi
