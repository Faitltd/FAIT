#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Comparing Vite and Webpack builds${NC}"
echo ""

# Create backup of dist directory if it exists
if [ -d "dist" ]; then
  echo -e "${YELLOW}Backing up existing dist directory...${NC}"
  mv dist dist_backup
fi

# Build with Vite
echo -e "${BLUE}Building with Vite...${NC}"
npm run build
echo ""

# Analyze Vite build
echo -e "${YELLOW}Vite build stats:${NC}"
echo "Total size: $(du -sh dist | cut -f1)"
echo "File count: $(find dist -type f | wc -l)"
echo ""

# Save Vite build
echo -e "${YELLOW}Saving Vite build...${NC}"
mv dist dist_vite

# Build with Webpack
echo -e "${BLUE}Building with Webpack...${NC}"
npm run webpack:build
echo ""

# Analyze Webpack build
echo -e "${YELLOW}Webpack build stats:${NC}"
echo "Total size: $(du -sh dist | cut -f1)"
echo "File count: $(find dist -type f | wc -l)"
echo ""

# Save Webpack build
echo -e "${YELLOW}Saving Webpack build...${NC}"
mv dist dist_webpack

# Compare builds
echo -e "${GREEN}Build comparison:${NC}"
echo -e "${BLUE}Vite:${NC} $(du -sh dist_vite | cut -f1) ($(find dist_vite -type f | wc -l) files)"
echo -e "${BLUE}Webpack:${NC} $(du -sh dist_webpack | cut -f1) ($(find dist_webpack -type f | wc -l) files)"
echo ""

# Restore original dist directory if it existed
if [ -d "dist_backup" ]; then
  echo -e "${YELLOW}Restoring original dist directory...${NC}"
  mv dist_backup dist
fi

echo -e "${GREEN}Comparison complete!${NC}"
echo "Vite build is in dist_vite/"
echo "Webpack build is in dist_webpack/"
