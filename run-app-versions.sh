#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}FAIT Co-op App Version Selector${NC}"
echo -e "${YELLOW}This script helps you run different versions of the FAIT Co-op app${NC}"

# Function to display menu
show_menu() {
  echo -e "\n${BLUE}Available App Versions:${NC}"
  echo -e "  1) Simple Test App"
  echo -e "  2) Minimal App"
  echo -e "  3) Enhanced Minimal App"
  echo -e "  4) Full App"
  echo -e "  5) Exit"
  echo -e "\nEnter your choice [1-5]: "
}

# Function to run the app with the selected version
run_app() {
  local version=$1
  local port=${2:-5173}
  
  echo -e "${GREEN}Starting the $version on port $port...${NC}"
  
  case $version in
    "Simple Test App")
      VITE_APP_VERSION=simple npm run dev -- --port $port
      ;;
    "Minimal App")
      VITE_APP_VERSION=minimal npm run dev -- --port $port
      ;;
    "Enhanced Minimal App")
      VITE_APP_VERSION=enhanced npm run dev -- --port $port
      ;;
    "Full App")
      VITE_APP_VERSION=full npm run dev -- --port $port
      ;;
    *)
      echo -e "${RED}Invalid version selected${NC}"
      exit 1
      ;;
  esac
}

# Check if port is provided as an argument, default to 5173
PORT=${1:-5173}

# Main menu loop
while true; do
  show_menu
  read -r choice
  
  case $choice in
    1)
      run_app "Simple Test App" $PORT
      break
      ;;
    2)
      run_app "Minimal App" $PORT
      break
      ;;
    3)
      run_app "Enhanced Minimal App" $PORT
      break
      ;;
    4)
      run_app "Full App" $PORT
      break
      ;;
    5)
      echo -e "${YELLOW}Exiting...${NC}"
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid choice. Please enter a number between 1 and 5.${NC}"
      ;;
  esac
done
