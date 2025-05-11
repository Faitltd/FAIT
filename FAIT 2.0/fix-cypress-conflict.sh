#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Fixing Cypress configuration conflict...${NC}"

# Check if cypress.config.cjs exists
if [ -f "cypress.config.cjs" ]; then
  echo -e "${YELLOW}Removing conflicting cypress.config.cjs file...${NC}"
  rm cypress.config.cjs
  echo -e "${GREEN}Conflict resolved. Using cypress.config.js (ES Module syntax).${NC}"
else
  echo -e "${GREEN}No conflict found. Using cypress.config.js (ES Module syntax).${NC}"
fi

echo -e "${GREEN}Cypress configuration is ready.${NC}"
