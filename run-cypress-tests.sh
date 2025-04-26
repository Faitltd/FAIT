#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting FAIT Co-op Cypress Tests${NC}"
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

# Run the new tests
echo -e "${GREEN}Running new tests...${NC}"
npx cypress run --spec "cypress/e2e/app-navigation.cy.js,cypress/e2e/auth-flow.cy.js,cypress/e2e/responsive-design.cy.js,cypress/e2e/client-dashboard.cy.js,cypress/e2e/service-agent.cy.js,cypress/e2e/project-management.cy.js,cypress/e2e/community-features.cy.js,cypress/e2e/accessibility.cy.js,cypress/e2e/performance.cy.js,cypress/e2e/visual-testing.cy.js,cypress/e2e/form-validation.cy.js,cypress/e2e/navigation-flow.cy.js" --browser chrome

# Check if tests passed
if [ $? -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
else
  echo -e "${RED}Some tests failed. Check the test results for details.${NC}"
fi

echo ""
echo -e "${GREEN}Testing completed!${NC}"
