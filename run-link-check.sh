#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting FAIT Co-op Link Checker${NC}"
echo ""

# Check if the application is running
echo -e "${YELLOW}Checking if the application is running...${NC}"
curl -s http://localhost:5173 > /dev/null
if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Application is not running at http://localhost:5173${NC}"
  echo "Starting the application..."
  npm run dev &
  DEV_PID=$!
  
  # Wait for the server to start
  echo -e "${YELLOW}Waiting for the server to start...${NC}"
  for i in {1..30}; do
    if curl -s http://localhost:5173 > /dev/null; then
      echo -e "${GREEN}Development server started successfully!${NC}"
      break
    fi
    
    if [ $i -eq 30 ]; then
      echo -e "${RED}Failed to start development server after 30 seconds.${NC}"
      exit 1
    fi
    
    echo -n "."
    sleep 1
  done
  echo ""
else
  echo -e "${GREEN}Application is already running at http://localhost:5173${NC}"
  DEV_PID=""
fi

# Create results directory
mkdir -p cypress/results

# Run the link checker test
echo -e "${GREEN}Running link checker test...${NC}"
npx cypress run --spec "cypress/e2e/broken-links-check.cy.js" --browser chrome > cypress/results/link-check-results.txt

# Check if tests passed
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Link check completed successfully!${NC}"
else
  echo -e "${RED}Link check encountered errors. Check the results for details.${NC}"
fi

# Extract broken links from the results
echo -e "${YELLOW}Extracting broken links from results...${NC}"
grep "BROKEN LINK:" cypress/results/link-check-results.txt > cypress/results/broken-links.txt

# Count broken links
BROKEN_COUNT=$(grep -c "BROKEN LINK:" cypress/results/link-check-results.txt)

# Display results
echo ""
echo -e "${GREEN}Link Check Results:${NC}"
echo -e "${YELLOW}Total broken links found: ${BROKEN_COUNT}${NC}"

if [ $BROKEN_COUNT -gt 0 ]; then
  echo -e "${RED}Broken links found:${NC}"
  cat cypress/results/broken-links.txt
else
  echo -e "${GREEN}No broken links found!${NC}"
fi

# If we started the server, shut it down
if [ ! -z "$DEV_PID" ]; then
  echo -e "${YELLOW}Shutting down development server...${NC}"
  kill $DEV_PID
  wait $DEV_PID 2>/dev/null
  echo -e "${GREEN}Development server stopped.${NC}"
fi

echo ""
echo -e "${GREEN}Link check completed!${NC}"
echo -e "${YELLOW}Full results available at: cypress/results/link-check-results.txt${NC}"
