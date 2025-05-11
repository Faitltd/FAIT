#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if category parameter is provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: No test category specified${NC}"
  echo "Usage: ./run-cypress-category.sh <category>"
  echo "Available categories:"
  echo "  navigation - App navigation tests"
  echo "  auth - Authentication flow tests"
  echo "  responsive - Responsive design tests"
  echo "  client - Client dashboard tests"
  echo "  service - Service agent tests"
  echo "  project - Project management tests"
  echo "  community - Community features tests"
  echo "  accessibility - Accessibility tests"
  echo "  performance - Performance tests"
  echo "  visual - Visual testing"
  echo "  form - Form validation tests"
  echo "  flow - Navigation flow tests"
  echo "  all - All tests"
  exit 1
fi

# Set the test spec based on the category
case "$1" in
  navigation)
    SPEC="cypress/e2e/app-navigation.cy.js"
    ;;
  auth)
    SPEC="cypress/e2e/auth-flow.cy.js"
    ;;
  responsive)
    SPEC="cypress/e2e/responsive-design.cy.js"
    ;;
  client)
    SPEC="cypress/e2e/client-dashboard.cy.js"
    ;;
  service)
    SPEC="cypress/e2e/service-agent.cy.js"
    ;;
  project)
    SPEC="cypress/e2e/project-management.cy.js"
    ;;
  community)
    SPEC="cypress/e2e/community-features.cy.js"
    ;;
  accessibility)
    SPEC="cypress/e2e/accessibility.cy.js"
    ;;
  performance)
    SPEC="cypress/e2e/performance.cy.js"
    ;;
  visual)
    SPEC="cypress/e2e/visual-testing.cy.js"
    ;;
  form)
    SPEC="cypress/e2e/form-validation.cy.js"
    ;;
  flow)
    SPEC="cypress/e2e/navigation-flow.cy.js"
    ;;
  all)
    SPEC="cypress/e2e/*.cy.js"
    ;;
  *)
    echo -e "${RED}Error: Invalid category '${1}'${NC}"
    echo "Run ./run-cypress-category.sh without arguments to see available categories"
    exit 1
    ;;
esac

echo -e "${GREEN}Starting FAIT Co-op Cypress Tests - Category: ${1}${NC}"
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

# Run the tests
echo -e "${GREEN}Running ${1} tests...${NC}"
npx cypress run --spec "${SPEC}" --browser chrome

# Check if tests passed
if [ $? -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
else
  echo -e "${RED}Some tests failed. Check the test results for details.${NC}"
fi

echo ""
echo -e "${GREEN}Testing completed!${NC}"
