#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if bundler parameter is provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: No bundler specified${NC}"
  echo "Usage: ./switch-bundler.sh <bundler>"
  echo "Available bundlers:"
  echo "  vite - Use Vite bundler"
  echo "  webpack - Use Webpack bundler"
  exit 1
fi

# Set the bundler based on the parameter
case "$1" in
  vite)
    echo -e "${GREEN}Switching to Vite bundler${NC}"
    echo ""
    echo -e "${YELLOW}Starting Vite development server...${NC}"
    npm run dev
    ;;
  webpack)
    echo -e "${GREEN}Switching to Webpack bundler${NC}"
    echo ""
    echo -e "${YELLOW}Starting Webpack development server...${NC}"
    npm run webpack:dev
    ;;
  *)
    echo -e "${RED}Error: Invalid bundler '${1}'${NC}"
    echo "Run ./switch-bundler.sh without arguments to see available bundlers"
    exit 1
    ;;
esac
