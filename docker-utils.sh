#!/bin/bash

# Docker utilities script for FAIT Co-op platform

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to display help
show_help() {
  echo -e "${GREEN}FAIT Co-op Docker Utilities${NC}"
  echo ""
  echo "Usage: ./docker-utils.sh [command]"
  echo ""
  echo "Commands:"
  echo "  start             Start all services in development mode"
  echo "  start:prod        Start all services in production mode"
  echo "  stop              Stop all services"
  echo "  restart           Restart all services"
  echo "  logs [service]    View logs (optionally for a specific service)"
  echo "  status            Show status of all services"
  echo "  build [service]   Rebuild services (optionally a specific service)"
  echo "  clean             Remove all containers, volumes, and images"
  echo "  backup            Create a database backup"
  echo "  restore [file]    Restore database from backup file"
  echo "  shell [service]   Open a shell in a service container"
  echo "  help              Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./docker-utils.sh start"
  echo "  ./docker-utils.sh logs api"
  echo "  ./docker-utils.sh backup"
  echo "  ./docker-utils.sh restore backups/fait_coop_2023-01-01.sql"
}

# Function to start services in development mode
start_dev() {
  echo -e "${GREEN}Starting services in development mode...${NC}"
  docker-compose up -d
  echo -e "${GREEN}Services started. Frontend available at: http://localhost:3000${NC}"
}

# Function to start services in production mode
start_prod() {
  echo -e "${GREEN}Starting services in production mode...${NC}"
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
  echo -e "${GREEN}Services started in production mode. Frontend available at: http://localhost:3000${NC}"
}

# Function to stop services
stop_services() {
  echo -e "${YELLOW}Stopping services...${NC}"
  docker-compose down
  echo -e "${GREEN}Services stopped.${NC}"
}

# Function to restart services
restart_services() {
  echo -e "${YELLOW}Restarting services...${NC}"
  docker-compose restart
  echo -e "${GREEN}Services restarted.${NC}"
}

# Function to view logs
view_logs() {
  if [ -z "$1" ]; then
    echo -e "${GREEN}Viewing logs for all services...${NC}"
    docker-compose logs -f
  else
    echo -e "${GREEN}Viewing logs for $1...${NC}"
    docker-compose logs -f "$1"
  fi
}

# Function to show status
show_status() {
  echo -e "${GREEN}Service status:${NC}"
  docker-compose ps
}

# Function to build services
build_services() {
  if [ -z "$1" ]; then
    echo -e "${YELLOW}Building all services...${NC}"
    docker-compose build
    echo -e "${GREEN}All services built.${NC}"
  else
    echo -e "${YELLOW}Building service: $1...${NC}"
    docker-compose build "$1"
    echo -e "${GREEN}Service $1 built.${NC}"
  fi
}

# Function to clean up
clean_up() {
  echo -e "${RED}WARNING: This will remove all containers, volumes, and images related to this project.${NC}"
  read -p "Are you sure you want to continue? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Stopping and removing containers...${NC}"
    docker-compose down -v
    
    echo -e "${YELLOW}Removing project images...${NC}"
    docker rmi $(docker images 'fait-coop/*' -q) 2>/dev/null || true
    
    echo -e "${GREEN}Clean up complete.${NC}"
  else
    echo -e "${YELLOW}Clean up cancelled.${NC}"
  fi
}

# Function to backup database
backup_db() {
  BACKUP_DIR="./backups"
  TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  BACKUP_FILE="${BACKUP_DIR}/fait_coop_${TIMESTAMP}.sql"
  
  # Create backup directory if it doesn't exist
  mkdir -p "$BACKUP_DIR"
  
  echo -e "${YELLOW}Creating database backup...${NC}"
  docker-compose exec -T db pg_dump -U postgres fait_coop > "$BACKUP_FILE"
  
  # Check if backup was successful
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Backup created: $BACKUP_FILE${NC}"
  else
    echo -e "${RED}Backup failed.${NC}"
    exit 1
  fi
}

# Function to restore database
restore_db() {
  if [ -z "$1" ]; then
    echo -e "${RED}Error: No backup file specified.${NC}"
    echo "Usage: ./docker-utils.sh restore [backup_file]"
    exit 1
  fi
  
  if [ ! -f "$1" ]; then
    echo -e "${RED}Error: Backup file not found: $1${NC}"
    exit 1
  fi
  
  echo -e "${YELLOW}Restoring database from $1...${NC}"
  cat "$1" | docker-compose exec -T db psql -U postgres fait_coop
  
  # Check if restore was successful
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Database restored successfully.${NC}"
  else
    echo -e "${RED}Database restore failed.${NC}"
    exit 1
  fi
}

# Function to open a shell in a container
open_shell() {
  if [ -z "$1" ]; then
    echo -e "${RED}Error: No service specified.${NC}"
    echo "Usage: ./docker-utils.sh shell [service]"
    exit 1
  fi
  
  echo -e "${GREEN}Opening shell in $1 container...${NC}"
  docker-compose exec "$1" sh
}

# Main script logic
case "$1" in
  start)
    start_dev
    ;;
  start:prod)
    start_prod
    ;;
  stop)
    stop_services
    ;;
  restart)
    restart_services
    ;;
  logs)
    view_logs "$2"
    ;;
  status)
    show_status
    ;;
  build)
    build_services "$2"
    ;;
  clean)
    clean_up
    ;;
  backup)
    backup_db
    ;;
  restore)
    restore_db "$2"
    ;;
  shell)
    open_shell "$2"
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    echo -e "${RED}Unknown command: $1${NC}"
    show_help
    exit 1
    ;;
esac

exit 0
