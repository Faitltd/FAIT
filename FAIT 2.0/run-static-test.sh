#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Running Static Test Page Cypress Tests${NC}"
echo ""

# Check if the server is running
echo -e "${YELLOW}Checking if the server is running...${NC}"
curl -s http://localhost:3001 > /dev/null
if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Server is not running at http://localhost:3001${NC}"
  echo "Please start the server using ./start-test-server.sh before running tests."
  exit 1
fi

# Check if the test page is accessible
echo -e "${YELLOW}Checking if the test page is accessible...${NC}"
curl -s http://localhost:3001/test.html > /dev/null
if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Test page is not accessible at http://localhost:3001/test.html${NC}"
  echo "Please make sure the test.html file is in the correct location."
  exit 1
fi

# Create test results directory
mkdir -p cypress/results

# Run the static test page tests
echo -e "${GREEN}Running static test page tests...${NC}"
npx cypress run --spec "cypress/e2e/static-test-page.cy.js" --browser chrome

# Check if tests passed
if [ $? -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
else
  echo -e "${RED}Some tests failed. Check the test results for details.${NC}"
fi

echo ""
echo -e "${GREEN}Testing completed!${NC}"
