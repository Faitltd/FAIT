#!/bin/bash

# This script sets up cron jobs for the FAIT monorepo

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up cron jobs for FAIT monorepo...${NC}"

# Get the absolute path to the monorepo
REPO_PATH=$(pwd)

# Create a temporary file for the crontab
TEMP_CRONTAB=$(mktemp)

# Export the current crontab
crontab -l > "$TEMP_CRONTAB" 2>/dev/null

# Check if the backup cron job already exists
if grep -q "backup.sh" "$TEMP_CRONTAB"; then
    echo -e "${YELLOW}Backup cron job already exists. Skipping...${NC}"
else
    # Add the backup cron job (runs daily at 2 AM)
    echo "0 2 * * * cd $REPO_PATH && ./backup.sh >> $REPO_PATH/backups/backup.log 2>&1" >> "$TEMP_CRONTAB"
    echo -e "${GREEN}Added backup cron job.${NC}"
fi

# Check if the SSL renewal cron job already exists
if grep -q "setup-ssl.sh" "$TEMP_CRONTAB"; then
    echo -e "${YELLOW}SSL renewal cron job already exists. Skipping...${NC}"
else
    # Add the SSL renewal cron job (runs weekly on Sunday at 3 AM)
    echo "0 3 * * 0 cd $REPO_PATH && ./setup-ssl.sh >> $REPO_PATH/nginx/ssl/ssl-renewal.log 2>&1" >> "$TEMP_CRONTAB"
    echo -e "${GREEN}Added SSL renewal cron job.${NC}"
fi

# Install the new crontab
crontab "$TEMP_CRONTAB"

# Clean up the temporary file
rm "$TEMP_CRONTAB"

echo -e "${GREEN}Cron jobs have been set up successfully!${NC}"
echo -e "${YELLOW}To view your cron jobs, run: crontab -l${NC}"
