#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to display help
show_help() {
  echo "Usage: ./dev.sh [options] [app]"
  echo ""
  echo "Options:"
  echo "  -h, --help     Show this help message"
  echo "  -b, --build    Build Docker images before starting"
  echo "  -c, --clean    Remove containers, volumes, and images before starting"
  echo ""
  echo "App:"
  echo "  Specify an app name to start only that app (e.g., fait-coop, offershield)"
  echo "  If no app is specified, all apps will be started"
  echo ""
  echo "Examples:"
  echo "  ./dev.sh                   # Start all apps"
  echo "  ./dev.sh -b                # Build and start all apps"
  echo "  ./dev.sh fait-coop         # Start only the FAIT Coop app"
  echo "  ./dev.sh -b offershield    # Build and start only the OfferShield app"
  echo "  ./dev.sh -c                # Clean and start all apps"
}

# Parse command line arguments
BUILD=false
CLEAN=false
APP=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      show_help
      exit 0
      ;;
    -b|--build)
      BUILD=true
      shift
      ;;
    -c|--clean)
      CLEAN=true
      shift
      ;;
    *)
      APP="$1"
      shift
      ;;
  esac
done

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Docker is not running. Please start Docker and try again.${NC}"
  exit 1
fi

# Clean if requested
if [ "$CLEAN" = true ]; then
  echo -e "${YELLOW}Cleaning up Docker containers, volumes, and images...${NC}"
  docker-compose -f docker-compose.development.yml down -v
  docker system prune -f
fi

# Build if requested
if [ "$BUILD" = true ]; then
  echo -e "${YELLOW}Building Docker images...${NC}"
  if [ -n "$APP" ]; then
    docker-compose -f docker-compose.development.yml build "$APP"
  else
    docker-compose -f docker-compose.development.yml build
  fi
fi

# Start the development environment
echo -e "${GREEN}Starting development environment...${NC}"
if [ -n "$APP" ]; then
  echo -e "${YELLOW}Starting only the $APP app...${NC}"
  docker-compose -f docker-compose.development.yml up -d nginx "$APP"
else
  echo -e "${YELLOW}Starting all apps...${NC}"
  docker-compose -f docker-compose.development.yml up -d
fi

echo -e "${GREEN}Development environment is running!${NC}"
echo -e "${YELLOW}You can access the apps at:${NC}"
echo -e "${GREEN}Main:${NC} http://localhost"
echo -e "${GREEN}FAIT Coop:${NC} http://coop.localhost"
echo -e "${GREEN}OfferShield:${NC} http://offer.localhost"
echo -e "${GREEN}HomeHealthScore:${NC} http://score.localhost"
echo -e "${GREEN}Handyman Calculator:${NC} http://handy.localhost"
echo -e "${GREEN}FlipperCalc:${NC} http://flipper.localhost"
echo -e "${GREEN}Remodeling Calculator:${NC} http://remodel.localhost"
echo ""
echo -e "${YELLOW}To view logs:${NC} docker-compose -f docker-compose.development.yml logs -f [app]"
echo -e "${YELLOW}To stop:${NC} docker-compose -f docker-compose.development.yml down"
