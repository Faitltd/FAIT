#!/bin/bash

# This script runs all the tests for the FAIT Co-op platform
#
# Usage:
# ./scripts/run-all-tests.sh

# Set text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Load environment variables from .env file
if [ -f .env ]; then
  echo -e "${YELLOW}Loading environment variables from .env file...${NC}"
  export $(grep -v '^#' .env | xargs)
else
  echo -e "${RED}Error: .env file not found.${NC}"
  exit 1
fi

# Function to run a test and check its result
run_test() {
  local test_name=$1
  local test_command=$2

  echo -e "\n${YELLOW}Running $test_name...${NC}"

  if eval $test_command; then
    echo -e "${GREEN}$test_name passed!${NC}"
    return 0
  else
    echo -e "${RED}$test_name failed!${NC}"
    return 1
  fi
}

# Run all tests
echo -e "${YELLOW}Running all tests for FAIT Co-op platform...${NC}"

# Test Stripe integration
run_test "Stripe Integration Test" "node scripts/test-stripe.js"
STRIPE_TEST_RESULT=$?

# Test authentication (this is interactive, so we'll skip it in the automated test)
echo -e "\n${YELLOW}Authentication Test${NC}"
echo -e "To test authentication, run: node scripts/test-auth.js"

# Check if domain is provided as an argument
if [ ! -z "$1" ]; then
  # Test domain status
  run_test "Domain Status Check" "./scripts/check-domain-status.sh $1"
  DOMAIN_TEST_RESULT=$?
else
  echo -e "\n${YELLOW}Domain Status Check${NC}"
  echo -e "To check domain status, run: ./scripts/check-domain-status.sh your-domain.com"
  DOMAIN_TEST_RESULT=0
fi

# Print summary
echo -e "\n${YELLOW}Test Summary:${NC}"
[ $STRIPE_TEST_RESULT -eq 0 ] && echo -e "${GREEN}✓${NC} Stripe Integration Test" || echo -e "${RED}✗${NC} Stripe Integration Test"
echo -e "${YELLOW}?${NC} Authentication Test (manual)"
[ $DOMAIN_TEST_RESULT -eq 0 ] && echo -e "${GREEN}✓${NC} Domain Status Check" || echo -e "${RED}✗${NC} Domain Status Check"

# Check if all tests passed
if [ $STRIPE_TEST_RESULT -eq 0 ] && [ $DOMAIN_TEST_RESULT -eq 0 ]; then
  echo -e "\n${GREEN}All automated tests passed!${NC}"
  echo -e "You should also manually test authentication and user flows."
  echo -e "Ready for deployment? Run: ./scripts/deploy-to-cloudrun.sh"
else
  echo -e "\n${RED}Some tests failed. Please fix the issues before deploying.${NC}"
  exit 1
fi
