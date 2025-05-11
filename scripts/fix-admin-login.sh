#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Admin Login Fix Tool ===${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    echo "Please install Node.js first."
    exit 1
fi

# Run the fix script
echo -e "${YELLOW}Running admin schema fix script...${NC}"
node scripts/fix-admin-schema.js

# Check if the script was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Admin login fix completed successfully!${NC}"
else
    echo -e "${RED}Admin login fix failed. Please check the error messages above.${NC}"
    echo -e "${YELLOW}You can still use Emergency Login or Super Emergency Login for admin access.${NC}"
fi

echo ""
echo -e "${GREEN}Done!${NC}"
