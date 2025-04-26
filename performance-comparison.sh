#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Bundler Performance Comparison${NC}"
echo ""

# Create backup of dist directory if it exists
if [ -d "dist" ]; then
  echo -e "${YELLOW}Backing up existing dist directory...${NC}"
  mv dist dist_backup
fi

# Measure Vite build time
echo -e "${BLUE}Measuring Vite build time...${NC}"
START_TIME=$(date +%s.%N)
npm run build > /dev/null 2>&1
END_TIME=$(date +%s.%N)
VITE_BUILD_TIME=$(echo "$END_TIME - $START_TIME" | bc)
echo -e "${YELLOW}Vite build time: ${VITE_BUILD_TIME} seconds${NC}"

# Get Vite build size
VITE_BUILD_SIZE=$(du -sh dist | cut -f1)
echo -e "${YELLOW}Vite build size: ${VITE_BUILD_SIZE}${NC}"

# Save Vite build
mv dist dist_vite

# Measure Webpack build time
echo -e "${BLUE}Measuring Webpack build time...${NC}"
START_TIME=$(date +%s.%N)
npm run webpack:build > /dev/null 2>&1
END_TIME=$(date +%s.%N)
WEBPACK_BUILD_TIME=$(echo "$END_TIME - $START_TIME" | bc)
echo -e "${YELLOW}Webpack build time: ${WEBPACK_BUILD_TIME} seconds${NC}"

# Get Webpack build size
WEBPACK_BUILD_SIZE=$(du -sh dist | cut -f1)
echo -e "${YELLOW}Webpack build size: ${WEBPACK_BUILD_SIZE}${NC}"

# Save Webpack build
mv dist dist_webpack

# Compare builds
echo ""
echo -e "${GREEN}Performance Comparison:${NC}"
echo -e "${BLUE}Vite:${NC}"
echo -e "  Build time: ${VITE_BUILD_TIME} seconds"
echo -e "  Build size: ${VITE_BUILD_SIZE}"
echo ""
echo -e "${BLUE}Webpack:${NC}"
echo -e "  Build time: ${WEBPACK_BUILD_TIME} seconds"
echo -e "  Build size: ${WEBPACK_BUILD_SIZE}"
echo ""

# Calculate time difference
TIME_DIFF=$(echo "$WEBPACK_BUILD_TIME - $VITE_BUILD_TIME" | bc)
if (( $(echo "$TIME_DIFF > 0" | bc -l) )); then
  FASTER="Vite"
  PERCENT_FASTER=$(echo "($WEBPACK_BUILD_TIME - $VITE_BUILD_TIME) / $WEBPACK_BUILD_TIME * 100" | bc -l)
  PERCENT_FASTER=$(printf "%.2f" $PERCENT_FASTER)
else
  FASTER="Webpack"
  PERCENT_FASTER=$(echo "($VITE_BUILD_TIME - $WEBPACK_BUILD_TIME) / $VITE_BUILD_TIME * 100" | bc -l)
  PERCENT_FASTER=$(printf "%.2f" $PERCENT_FASTER)
fi

echo -e "${GREEN}${FASTER} was ${PERCENT_FASTER}% faster in build time${NC}"

# Restore original dist directory if it existed
if [ -d "dist_backup" ]; then
  echo -e "${YELLOW}Restoring original dist directory...${NC}"
  mv dist_backup dist
fi

echo ""
echo -e "${GREEN}Comparison complete!${NC}"
echo "Vite build is in dist_vite/"
echo "Webpack build is in dist_webpack/"
