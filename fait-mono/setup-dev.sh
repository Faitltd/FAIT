#!/bin/bash

# This script sets up the development environment for the FAIT monorepo

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up FAIT monorepo development environment...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js v16 or higher.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}Node.js version is too old. Please install Node.js v16 or higher.${NC}"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please update the .env file with your credentials.${NC}"
fi

# Create directories for apps if they don't exist
echo -e "${YELLOW}Creating app directories...${NC}"
mkdir -p apps/fait-coop
mkdir -p apps/offershield
mkdir -p apps/home-health-score
mkdir -p apps/handyman-calculator
mkdir -p apps/flippercalc
mkdir -p apps/remodeling-calculator
mkdir -p tools/home-depot-scraper

# Create directories for shared packages if they don't exist
echo -e "${YELLOW}Creating shared package directories...${NC}"
mkdir -p packages/ui/src
mkdir -p packages/auth/src
mkdir -p packages/config
mkdir -p packages/utils/src

# Build packages
echo -e "${YELLOW}Building shared packages...${NC}"
npm run build --workspaces --if-present

echo -e "${GREEN}Development environment setup complete!${NC}"
echo -e "${YELLOW}To start the development server, run:${NC}"
echo -e "${GREEN}npm run dev${NC}"
