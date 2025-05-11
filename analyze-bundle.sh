#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Webpack Bundle Analysis Tool${NC}"
echo ""

# Check if webpack-bundle-analyzer is installed
if ! npm list webpack-bundle-analyzer | grep -q webpack-bundle-analyzer; then
  echo -e "${RED}webpack-bundle-analyzer is not installed${NC}"
  echo -e "Installing webpack-bundle-analyzer..."
  npm install -D webpack-bundle-analyzer
fi

# Run webpack with bundle analyzer
echo -e "${BLUE}Building and analyzing webpack bundle...${NC}"
echo -e "${YELLOW}This will open a browser window with the bundle analysis.${NC}"
echo ""

# Set environment variable to enable bundle analyzer
ANALYZE=true npm run webpack:build

echo ""
echo -e "${GREEN}Bundle analysis complete!${NC}"
echo "The bundle analyzer should have opened in your browser."
echo "If it didn't open automatically, you can find the report in the stats.html file."
