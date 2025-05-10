#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}FAIT Co-op Performance Optimization Tool${NC}"
echo ""

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check for required tools
echo -e "${BLUE}Checking for required tools...${NC}"

if ! command_exists node; then
  echo -e "${RED}Node.js is not installed. Please install Node.js to continue.${NC}"
  exit 1
fi

if ! command_exists npm; then
  echo -e "${RED}npm is not installed. Please install npm to continue.${NC}"
  exit 1
fi

echo -e "${GREEN}All required tools are installed.${NC}"
echo ""

# Run performance tests
echo -e "${BLUE}Running performance tests...${NC}"
npm run perf:test

# Check for performance budget violations
echo -e "${BLUE}Checking for performance budget violations...${NC}"
npm run perf:monitor

# Ask user if they want to apply optimizations
echo ""
echo -e "${YELLOW}Would you like to apply performance optimizations? (y/n)${NC}"
read -r apply_optimizations

if [[ "$apply_optimizations" =~ ^[Yy]$ ]]; then
  echo ""
  echo -e "${BLUE}Applying performance optimizations...${NC}"
  
  # Build with performance optimizations
  echo -e "${BLUE}Building with performance optimizations...${NC}"
  npm run perf:build
  
  # Build with PWA support
  echo -e "${BLUE}Building with PWA support...${NC}"
  npm run pwa:build
  
  echo ""
  echo -e "${GREEN}Performance optimizations applied successfully!${NC}"
  echo ""
  echo -e "${YELLOW}Next steps:${NC}"
  echo "1. Run performance tests again to verify improvements"
  echo "2. Check for any remaining performance budget violations"
  echo "3. Deploy the optimized build"
else
  echo ""
  echo -e "${YELLOW}No optimizations applied.${NC}"
fi

# Ask user if they want to analyze the bundle
echo ""
echo -e "${YELLOW}Would you like to analyze the bundle? (y/n)${NC}"
read -r analyze_bundle

if [[ "$analyze_bundle" =~ ^[Yy]$ ]]; then
  echo ""
  echo -e "${BLUE}Analyzing bundle...${NC}"
  npm run webpack:perf:analyze
  
  echo ""
  echo -e "${GREEN}Bundle analysis complete!${NC}"
fi

echo ""
echo -e "${GREEN}Performance optimization process complete!${NC}"
