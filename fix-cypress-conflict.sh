#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Fixing Cypress Configuration Conflict ===${NC}"
echo ""

# Check for conflicting Cypress configuration files
if [ -f "cypress.config.cjs" ]; then
  echo -e "${YELLOW}Removing conflicting cypress.config.cjs file${NC}"
  rm cypress.config.cjs
  echo -e "${GREEN}Removed cypress.config.cjs${NC}"
else
  echo -e "${YELLOW}No cypress.config.cjs file found${NC}"
fi

echo ""
echo -e "${GREEN}Cypress configuration conflict has been fixed!${NC}"
echo -e "${GREEN}You can now run Cypress tests.${NC}"
