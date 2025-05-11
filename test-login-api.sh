#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Testing Login API Directly${NC}"
echo ""

# Run the Node.js script
echo -e "${YELLOW}Running login API tests...${NC}"
node scripts/test-login-credentials.js

# Check if tests passed
if [ $? -eq 0 ]; then
  echo -e "${GREEN}All login API tests passed!${NC}"
else
  echo -e "${RED}Some login API tests failed. Check the output for details.${NC}"
fi

echo ""
echo -e "${GREEN}Testing completed!${NC}"
