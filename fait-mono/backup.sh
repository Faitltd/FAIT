#!/bin/bash

# This script creates backups of the FAIT monorepo

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create backup directory if it doesn't exist
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Get current date and time for backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/fait_backup_$TIMESTAMP.tar.gz"

echo -e "${GREEN}Creating backup of FAIT monorepo...${NC}"

# Create a list of directories to backup
DIRS_TO_BACKUP=(
    "apps"
    "packages"
    "tools"
    ".github"
    "nginx"
    "monitoring"
)

# Create a list of files to backup
FILES_TO_BACKUP=(
    "package.json"
    "package-lock.json"
    "turbo.json"
    "tsconfig.base.json"
    "docker-compose.monorepo.yml"
    "docker-compose.monitoring.yml"
    ".env.example"
)

# Create temporary directory for files to backup
TMP_DIR=$(mktemp -d)

# Copy directories to backup
for dir in "${DIRS_TO_BACKUP[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${YELLOW}Backing up directory: $dir${NC}"
        cp -r "$dir" "$TMP_DIR/"
    else
        echo -e "${RED}Directory not found: $dir${NC}"
    fi
done

# Copy files to backup
for file in "${FILES_TO_BACKUP[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${YELLOW}Backing up file: $file${NC}"
        cp "$file" "$TMP_DIR/"
    else
        echo -e "${RED}File not found: $file${NC}"
    fi
done

# Create tarball
echo -e "${YELLOW}Creating tarball...${NC}"
tar -czf "$BACKUP_FILE" -C "$TMP_DIR" .

# Clean up temporary directory
rm -rf "$TMP_DIR"

# Check if backup was successful
if [ -f "$BACKUP_FILE" ]; then
    echo -e "${GREEN}Backup created successfully: $BACKUP_FILE${NC}"
    echo -e "${YELLOW}Backup size: $(du -h "$BACKUP_FILE" | cut -f1)${NC}"
else
    echo -e "${RED}Backup failed!${NC}"
    exit 1
fi

# Keep only the 5 most recent backups
echo -e "${YELLOW}Cleaning up old backups...${NC}"
ls -t "$BACKUP_DIR"/fait_backup_*.tar.gz | tail -n +6 | xargs -r rm

echo -e "${GREEN}Backup process completed!${NC}"
