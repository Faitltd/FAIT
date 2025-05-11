#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting FAIT Co-op Test Server${NC}"
echo ""

# Check if port 3001 is already in use
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}Port 3001 is already in use. Stopping the existing process...${NC}"
    kill $(lsof -Pi :3001 -sTCP:LISTEN -t) 2>/dev/null
    sleep 2
fi

# Start the server using Vite on port 3001
echo -e "${GREEN}Starting Vite server on port 3001...${NC}"
# Use the Vite from the parent directory
cd ..
npx vite --port 3001 &
SERVER_PID=$!

# Wait for the server to start
echo -e "${YELLOW}Waiting for server to start...${NC}"
sleep 5

# Check if the server is running
curl -s http://localhost:3001 > /dev/null
if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Server failed to start on port 3001${NC}"
  kill $SERVER_PID 2>/dev/null
  exit 1
fi

echo -e "${GREEN}Server is running on http://localhost:3001${NC}"
echo -e "${YELLOW}Static test page available at: http://localhost:3001/test.html${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"

# Keep the script running until Ctrl+C
wait $SERVER_PID
