#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}FAIT Co-op App Testing Script${NC}"
echo -e "${YELLOW}This script will start the development server with different app versions${NC}"

# Check if port is provided as an argument, default to 5173
PORT=${1:-5173}

# Start the development server
echo -e "${GREEN}Starting Vite development server on port $PORT...${NC}"
echo -e "${YELLOW}You can access the app at http://localhost:$PORT${NC}"
echo -e "${YELLOW}Available versions:${NC}"
echo -e "  - Simple Test App: ${GREEN}http://localhost:$PORT/?version=simple${NC}"
echo -e "  - Minimal App: ${GREEN}http://localhost:$PORT/?version=minimal${NC}"
echo -e "  - Enhanced Minimal App: ${GREEN}http://localhost:$PORT/?version=enhanced${NC}"
echo -e "  - Full App: ${GREEN}http://localhost:$PORT/?version=full${NC}"

# Start the server
npx vite --port $PORT

# This will keep running until user terminates with Ctrl+C
