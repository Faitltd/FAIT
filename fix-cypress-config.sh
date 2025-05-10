#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Fixing Cypress Configuration ===${NC}"
echo ""

# Check if the original webpack files exist and rename them if they do
if [ -f "webpack.config.js" ]; then
  echo -e "${YELLOW}Renaming webpack.config.js to webpack.config.cjs${NC}"
  mv webpack.config.js webpack.config.js.bak
fi

if [ -f "webpack.env.js" ]; then
  echo -e "${YELLOW}Renaming webpack.env.js to webpack.env.js.bak${NC}"
  mv webpack.env.js webpack.env.js.bak
fi

if [ -f "webpack.dev.js" ]; then
  echo -e "${YELLOW}Renaming webpack.dev.js to webpack.dev.js.bak${NC}"
  mv webpack.dev.js webpack.dev.js.bak
fi

if [ -f "webpack.prod.js" ]; then
  echo -e "${YELLOW}Renaming webpack.prod.js to webpack.prod.js.bak${NC}"
  mv webpack.prod.js webpack.prod.js.bak
fi

if [ -f "webpack.test.js" ]; then
  echo -e "${YELLOW}Renaming webpack.test.js to webpack.test.js.bak${NC}"
  mv webpack.test.js webpack.test.js.bak
fi

if [ -f "webpack.dashboard.js" ]; then
  echo -e "${YELLOW}Renaming webpack.dashboard.js to webpack.dashboard.js.bak${NC}"
  mv webpack.dashboard.js webpack.dashboard.js.bak
fi

echo -e "${GREEN}All webpack configuration files have been renamed with .bak extension.${NC}"
echo -e "${GREEN}The new .cjs files will be used instead.${NC}"
echo ""

# Check for conflicting Cypress configuration files
if [ -f "cypress.config.cjs" ]; then
  echo -e "${YELLOW}Removing conflicting cypress.config.cjs file${NC}"
  rm cypress.config.cjs
fi

# Run Cypress to verify the configuration
echo -e "${YELLOW}Running Cypress to verify the configuration...${NC}"
npx cypress open

echo ""
echo -e "${GREEN}Cypress configuration has been fixed!${NC}"
echo ""
echo -e "${YELLOW}If you encounter any issues, you can restore the original files by running:${NC}"
echo "mv webpack.config.js.bak webpack.config.js"
echo "mv webpack.env.js.bak webpack.env.js"
echo "mv webpack.dev.js.bak webpack.dev.js"
echo "mv webpack.prod.js.bak webpack.prod.js"
echo "mv webpack.test.js.bak webpack.test.js"
echo "mv webpack.dashboard.js.bak webpack.dashboard.js"
