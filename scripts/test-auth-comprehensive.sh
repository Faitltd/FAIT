#!/bin/bash

# Comprehensive Authentication Test Script
# This script tests the authentication system with all test credentials

# Text colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== FAIT Co-op Authentication Test ===${NC}"
echo -e "${BLUE}Testing all authentication credentials${NC}"
echo ""

# Test credentials
CREDENTIALS=(
  "admin@itsfait.com:admin123:admin"
  "client@itsfait.com:client123:client"
  "service@itsfait.com:service123:service_agent"
)

# Function to test login
test_login() {
  local email=$1
  local password=$2
  local expected_type=$3
  
  echo -e "${YELLOW}Testing login for ${email}${NC}"
  
  # Run the test script
  result=$(node scripts/test-auth-credentials.cjs "$email" "$password")
  
  # Check if login was successful
  if [[ $result == *"Login successful"* ]]; then
    echo -e "${GREEN}✓ Login successful${NC}"
    
    # Check if user type is correct
    if [[ $result == *"User type: $expected_type"* ]]; then
      echo -e "${GREEN}✓ User type is correct: $expected_type${NC}"
    else
      echo -e "${RED}✗ User type is incorrect. Expected: $expected_type${NC}"
      echo -e "${YELLOW}Result: $result${NC}"
      return 1
    fi
    
    return 0
  else
    echo -e "${RED}✗ Login failed${NC}"
    echo -e "${YELLOW}Result: $result${NC}"
    return 1
  fi
}

# Test all credentials
success_count=0
failure_count=0

for cred in "${CREDENTIALS[@]}"; do
  IFS=':' read -r email password expected_type <<< "$cred"
  
  if test_login "$email" "$password" "$expected_type"; then
    ((success_count++))
  else
    ((failure_count++))
  fi
  
  echo ""
done

# Print summary
echo -e "${BLUE}=== Test Summary ===${NC}"
echo -e "${GREEN}Successful logins: $success_count${NC}"
echo -e "${RED}Failed logins: $failure_count${NC}"

if [ $failure_count -eq 0 ]; then
  echo -e "${GREEN}All authentication tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some authentication tests failed.${NC}"
  exit 1
fi
