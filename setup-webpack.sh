#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Webpack Setup Script${NC}"
echo ""

# Check if webpack is installed
if ! npm list webpack | grep -q webpack; then
  echo -e "${RED}webpack is not installed${NC}"
  echo -e "Installing webpack..."
  npm install -D webpack webpack-cli
fi

# Check for required webpack plugins
echo -e "${BLUE}Checking for required webpack plugins...${NC}"
MISSING_PACKAGES=""

check_package() {
  if ! npm list $1 | grep -q $1; then
    MISSING_PACKAGES="$MISSING_PACKAGES $1"
  else
    echo -e "${GREEN}✓ $1 is installed${NC}"
  fi
}

check_package "html-webpack-plugin"
check_package "mini-css-extract-plugin"
check_package "css-minimizer-webpack-plugin"
check_package "clean-webpack-plugin"
check_package "ts-loader"
check_package "style-loader"
check_package "css-loader"
check_package "postcss-loader"
check_package "webpack-dev-server"
check_package "webpack-bundle-analyzer"
check_package "cross-env"

# Install missing packages
if [ ! -z "$MISSING_PACKAGES" ]; then
  echo -e "${YELLOW}Installing missing packages:${NC} $MISSING_PACKAGES"
  npm install -D $MISSING_PACKAGES
fi

# Check for webpack config file
if [ ! -f "webpack.config.js" ]; then
  echo -e "${RED}webpack.config.js not found${NC}"
  echo -e "Please make sure you have a webpack.config.js file in your project root."
  exit 1
else
  echo -e "${GREEN}✓ webpack.config.js found${NC}"
fi

# Check for webpack entry point
if [ ! -f "src/webpack-entry.tsx" ]; then
  echo -e "${RED}src/webpack-entry.tsx not found${NC}"
  echo -e "Please make sure you have a webpack-entry.tsx file in your src directory."
  exit 1
else
  echo -e "${GREEN}✓ src/webpack-entry.tsx found${NC}"
fi

# Check for webpack HTML template
if [ ! -f "webpack-index.html" ]; then
  echo -e "${RED}webpack-index.html not found${NC}"
  echo -e "Please make sure you have a webpack-index.html file in your project root."
  exit 1
else
  echo -e "${GREEN}✓ webpack-index.html found${NC}"
fi

# Check for webpack TypeScript config
if [ ! -f "tsconfig.webpack.json" ]; then
  echo -e "${RED}tsconfig.webpack.json not found${NC}"
  echo -e "Please make sure you have a tsconfig.webpack.json file in your project root."
  exit 1
else
  echo -e "${GREEN}✓ tsconfig.webpack.json found${NC}"
fi

# Check for webpack scripts in package.json
if ! grep -q "webpack:dev" package.json; then
  echo -e "${RED}webpack scripts not found in package.json${NC}"
  echo -e "Please make sure you have webpack scripts in your package.json file."
  exit 1
else
  echo -e "${GREEN}✓ webpack scripts found in package.json${NC}"
fi

echo ""
echo -e "${GREEN}Webpack setup complete!${NC}"
echo "You can now run the following commands:"
echo "  npm run webpack:dev - Start webpack development server"
echo "  npm run webpack:build - Build for production with webpack"
echo "  npm run webpack:analyze - Analyze webpack bundle"
echo ""
echo -e "${YELLOW}Would you like to start the webpack development server now? (y/n)${NC}"
read -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${BLUE}Starting webpack development server...${NC}"
  npm run webpack:dev
fi
