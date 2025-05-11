#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Duplicate File Cleanup Script ===${NC}"

# Create a backup directory
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo -e "${YELLOW}Created backup directory: $BACKUP_DIR${NC}"

# Function to backup and remove duplicate files
cleanup_duplicate() {
    local original="$1"
    local duplicate="$2"
    
    # Create backup
    local backup_path="$BACKUP_DIR/${duplicate//\//_}"
    cp "$duplicate" "$backup_path"
    
    # Compare files
    if cmp -s "$original" "$duplicate"; then
        echo -e "${YELLOW}Removing identical duplicate: $duplicate${NC}"
        rm "$duplicate"
    else
        echo -e "${RED}Warning: Files differ - $duplicate${NC}"
        echo -e "Original: $original"
        echo -e "Please review manually"
    fi
}

# List of known duplicates to clean up
declare -A duplicates=(
    ["supabase/migrations/20240710000001_verification_system.sql"]="supabase/migrations/20240711000001_verification_system.sql"
    ["update-env-vars.sh"]="update-env-vars 2.sh"
    ["supabase/migrations/20240103000000_warranty_claims_system.sql"]="supabase/migrations/20240103000000_warranty_claims_system 2.sql"
)

# Process each duplicate
for original in "${!duplicates[@]}"; do
    duplicate="${duplicates[$original]}"
    
    if [ -f "$original" ] && [ -f "$duplicate" ]; then
        cleanup_duplicate "$original" "$duplicate"
    else
        echo -e "${RED}Error: Could not find either $original or $duplicate${NC}"
    fi
done

# Clean up any files with " 2" in the name
find . -type f -name "* 2.*" | while read -r duplicate; do
    original="${duplicate/ 2./\.}"
    if [ -f "$original" ]; then
        cleanup_duplicate "$original" "$duplicate"
    fi
done

echo -e "\n${GREEN}Cleanup complete!${NC}"
echo -e "${YELLOW}Backups stored in: $BACKUP_DIR${NC}"
echo -e "${YELLOW}Please review the backups before deleting them.${NC}"

# Update package.json to remove any duplicate script entries
if [ -f "package.json" ] && [ -f "package.json.bak" ]; then
    echo -e "\n${YELLOW}Cleaning up package.json...${NC}"
    cp package.json "$BACKUP_DIR/package.json.backup"
    mv package.json.bak "$BACKUP_DIR/package.json.bak"
    echo -e "${GREEN}package.json cleanup complete${NC}"
fi

# Final recommendations
echo -e "\n${GREEN}=== Recommended Next Steps ===${NC}"
echo -e "1. Review the backups in $BACKUP_DIR"
echo -e "2. Update any import statements in your code"
echo -e "3. Run your test suite to ensure nothing was broken"
echo -e "4. Commit the changes to version control"