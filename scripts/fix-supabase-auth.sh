#!/bin/bash

# Script to fix Supabase auth schema issues and reset if needed
# This script provides options to:
# 1. Apply the database migration to fix schema issues
# 2. Reset the Supabase database if needed
# 3. Restart Supabase services

# Text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Supabase Auth Schema Fix Tool ===${NC}"
echo "This script will help fix issues with the Supabase auth schema."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed.${NC}"
    echo "Please install it first: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Function to apply the database migration
apply_migration() {
    echo -e "${YELLOW}Applying database migration to fix auth schema...${NC}"
    supabase db push
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Migration applied successfully!${NC}"
    else
        echo -e "${RED}Failed to apply migration.${NC}"
        return 1
    fi
    return 0
}

# Function to restart Supabase
restart_supabase() {
    echo -e "${YELLOW}Restarting Supabase services...${NC}"
    supabase stop
    supabase start
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Supabase restarted successfully!${NC}"
    else
        echo -e "${RED}Failed to restart Supabase.${NC}"
        return 1
    fi
    return 0
}

# Function to reset Supabase database
reset_supabase() {
    echo -e "${RED}WARNING: This will reset your Supabase database and delete all data!${NC}"
    echo -e "${YELLOW}Are you sure you want to continue? (y/N)${NC}"
    read -r confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Resetting Supabase database...${NC}"
        supabase db reset
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Database reset successfully!${NC}"
        else
            echo -e "${RED}Failed to reset database.${NC}"
            return 1
        fi
    else
        echo "Database reset cancelled."
        return 1
    fi
    return 0
}

# Main menu
while true; do
    echo ""
    echo -e "${BLUE}Choose an option:${NC}"
    echo "1) Apply database migration to fix auth schema"
    echo "2) Restart Supabase services"
    echo "3) Reset Supabase database (WARNING: deletes all data)"
    echo "4) Apply fix and restart (options 1 + 2)"
    echo "5) Reset database and apply fix (options 3 + 1 + 2)"
    echo "q) Quit"
    echo ""
    read -r choice
    
    case $choice in
        1)
            apply_migration
            ;;
        2)
            restart_supabase
            ;;
        3)
            reset_supabase
            ;;
        4)
            apply_migration && restart_supabase
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}Fix applied and Supabase restarted successfully!${NC}"
                echo "You can now try the OAuth login again."
            fi
            ;;
        5)
            reset_supabase && apply_migration && restart_supabase
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}Database reset, fix applied, and Supabase restarted successfully!${NC}"
                echo "You can now try the OAuth login again."
            fi
            ;;
        q|Q)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option. Please try again.${NC}"
            ;;
    esac
done
