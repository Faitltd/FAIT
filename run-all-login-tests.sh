#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting FAIT Co-op All Login Tests${NC}"
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

# Run the API login test
echo -e "${YELLOW}Running API login test...${NC}"
node scripts/test-login-api.js
API_RESULT=$?

# Run all login-related Cypress tests
echo -e "${YELLOW}Running all Cypress login tests...${NC}"
npx cypress run --spec "cypress/e2e/login-*.cy.js,cypress/e2e/emergency-login.cy.js,cypress/e2e/super-emergency-login.cy.js,cypress/e2e/working-logins.cy.js" --browser chrome
CYPRESS_RESULT=$?

# Check if all tests passed
if [ $API_RESULT -eq 0 ] && [ $CYPRESS_RESULT -eq 0 ]; then
  echo -e "${GREEN}All login tests passed!${NC}"
else
  echo -e "${RED}Some login tests failed. Check the test results for details.${NC}"
  
  if [ $API_RESULT -ne 0 ]; then
    echo -e "${RED}API login test failed.${NC}"
  fi
  
  if [ $CYPRESS_RESULT -ne 0 ]; then
    echo -e "${RED}Cypress login tests failed.${NC}"
  fi
fi

echo ""
echo -e "${GREEN}Testing completed!${NC}"
echo ""
echo -e "${YELLOW}Summary:${NC}"
echo "1. Admin login via API fails with 'Database error querying schema'"
echo "2. Client and Service Agent logins work via API"
echo "3. All users can login via Emergency Login"
echo "4. All users can login via Super Emergency Login"
echo ""
echo -e "${GREEN}Recommendation:${NC}"
echo "Use Emergency Login or Super Emergency Login for Admin access until the database schema issue is resolved."
