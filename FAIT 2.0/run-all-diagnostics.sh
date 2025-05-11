#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   FAIT 2.0 Black Screen Diagnostic Suite         ${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Function to display menu
show_menu() {
  echo -e "${GREEN}Available Diagnostic Tools:${NC}"
  echo -e "${YELLOW}1. Static Test Server${NC} - Test if server can serve static content"
  echo -e "${YELLOW}2. Simple Node.js Server (ES Module)${NC} - Alternative server that doesn't use Vite"
  echo -e "${YELLOW}3. Simple Node.js Server (CommonJS)${NC} - Alternative server with CommonJS syntax"
  echo -e "${YELLOW}4. Basic Node.js Server${NC} - Minimal server with no module system dependencies"
  echo -e "${YELLOW}5. CSS Diagnostic Tool${NC} - Identify CSS and styling issues"
  echo -e "${YELLOW}6. Debug Server${NC} - Run with enhanced debugging index.html"
  echo -e "${YELLOW}7. Fixed App${NC} - Run with components that force visibility"
  echo -e "${YELLOW}8. Console Error Check${NC} - Check for JavaScript errors"
  echo -e "${YELLOW}9. Basic Cypress Tests${NC} - Run basic rendering tests"
  echo -e "${YELLOW}10. View Troubleshooting Guide${NC} - Open the troubleshooting guide"
  echo -e "${YELLOW}11. Exit${NC}"
  echo ""
  echo -e "${GREEN}Enter your choice (1-11):${NC}"
}

# Function to run static test server
run_static_test_server() {
  echo -e "${BLUE}Running Static Test Server...${NC}"
  ./start-test-server.sh
}

# Function to run simple Node.js server (ES Module)
run_simple_server_esm() {
  echo -e "${BLUE}Running Simple Node.js Server (ES Module)...${NC}"
  ./run-simple-server.sh
}

# Function to run simple Node.js server (CommonJS)
run_simple_server_cjs() {
  echo -e "${BLUE}Running Simple Node.js Server (CommonJS)...${NC}"
  ./run-simple-server-cjs.sh
}

# Function to run basic Node.js server
run_basic_server() {
  echo -e "${BLUE}Running Basic Node.js Server...${NC}"
  ./run-basic-server.sh
}

# Function to run CSS diagnostic tool
run_css_diagnostic() {
  echo -e "${BLUE}Running CSS Diagnostic Tool...${NC}"
  ./run-css-diagnostic.sh
}

# Function to run debug server
run_debug_server() {
  echo -e "${BLUE}Running Debug Server...${NC}"
  ./start-debug-server.sh
}

# Function to run fixed app
run_fixed_app() {
  echo -e "${BLUE}Running Fixed App...${NC}"
  ./run-fixed-app.sh
}

# Function to run console error check
run_console_check() {
  echo -e "${BLUE}Running Console Error Check...${NC}"
  ./run-console-check.sh
}

# Function to run basic Cypress tests
run_basic_tests() {
  echo -e "${BLUE}Running Basic Cypress Tests...${NC}"
  ./run-basic-tests.sh
}

# Function to view troubleshooting guide
view_guide() {
  echo -e "${BLUE}Opening Troubleshooting Guide...${NC}"
  if command -v open >/dev/null 2>&1; then
    open BLACK_SCREEN_TROUBLESHOOTING.md
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open BLACK_SCREEN_TROUBLESHOOTING.md
  elif command -v start >/dev/null 2>&1; then
    start BLACK_SCREEN_TROUBLESHOOTING.md
  else
    echo -e "${RED}Could not open the guide automatically.${NC}"
    echo -e "${YELLOW}Please open BLACK_SCREEN_TROUBLESHOOTING.md manually.${NC}"
  fi
}

# Main menu loop
while true; do
  show_menu
  read choice

  case $choice in
    1) run_static_test_server ;;
    2) run_simple_server_esm ;;
    3) run_simple_server_cjs ;;
    4) run_basic_server ;;
    5) run_css_diagnostic ;;
    6) run_debug_server ;;
    7) run_fixed_app ;;
    8) run_console_check ;;
    9) run_basic_tests ;;
    10) view_guide ;;
    11)
      echo -e "${GREEN}Exiting...${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid choice. Please enter a number between 1 and 11.${NC}"
      ;;
  esac

  # Pause before showing menu again
  echo ""
  echo -e "${YELLOW}Press Enter to continue...${NC}"
  read
  clear
done
