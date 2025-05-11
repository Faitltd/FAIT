#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting FAIT Co-op Client Functionality Tests${NC}"
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

# Run all client tests
echo -e "${GREEN}Running all client tests...${NC}"
npx cypress run --spec "cypress/e2e/client/**/*.cy.js" --browser chrome

# Check if tests passed
if [ $? -eq 0 ]; then
  echo -e "${GREEN}All client tests passed!${NC}"
else
  echo -e "${RED}Some tests failed. Check the test results for details.${NC}"
fi

# Generate HTML report if Cypress Dashboard is not being used
if [ ! -z "$CYPRESS_RECORD_KEY" ]; then
  echo -e "${YELLOW}Test results are being recorded to Cypress Dashboard.${NC}"
else
  echo -e "${YELLOW}Generating HTML report...${NC}"
  npx mochawesome-merge cypress/results/*.json > cypress/results/report.json
  npx marge cypress/results/report.json -f report -o cypress/results
  echo -e "${GREEN}HTML report generated at cypress/results/report.html${NC}"
fi

echo ""
echo -e "${GREEN}Testing completed!${NC}"
