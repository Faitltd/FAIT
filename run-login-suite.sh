#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting FAIT Co-op Login Test Suite${NC}"
echo ""

# Make sure the application is running
echo -e "${YELLOW}Checking if the application is running...${NC}"
curl -s http://localhost:5173 > /dev/null
if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Application is not running at http://localhost:5173${NC}"
  echo "Please start the application before running tests."
  exit 1
fi

# Create test results directory
mkdir -p cypress/results

# Run the login test suite
echo -e "${GREEN}Running login test suite...${NC}"
npx cypress run --spec "cypress/e2e/login-suite.cy.js" --browser chrome

# Check if tests passed
if [ $? -eq 0 ]; then
  echo -e "${GREEN}All login tests passed!${NC}"
else
  echo -e "${RED}Some login tests failed. Check the test results for details.${NC}"
fi

echo ""
echo -e "${GREEN}Testing completed!${NC}"
