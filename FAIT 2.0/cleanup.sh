#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== FAIT Platform Cleanup Script ===${NC}"

# Create a backup directory
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo -e "${YELLOW}Created backup directory: $BACKUP_DIR${NC}"

# Function to backup and remove duplicate files
cleanup_duplicate() {
    local original="$1"
    local duplicate="$2"
    
    if [ ! -f "$original" ] || [ ! -f "$duplicate" ]; then
        echo -e "${RED}Error: Could not find either $original or $duplicate${NC}"
        return
    fi
    
    # Create backup
    local backup_path="$BACKUP_DIR/${duplicate//\//_}"
    mkdir -p "$(dirname "$backup_path")"
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
    ["project_copy/src/components/dashboard/ClientDashboard.tsx"]="project_copy/src/components/dashboard/ClientDashboard 2.tsx"
    ["project_copy/src/components/projects/CreateProjectForm.tsx"]="project_copy/src/components/projects/CreateProjectForm 2.tsx"
    ["project_copy/src/components/estimate/EstimateCalculator.tsx"]="project_copy/src/components/estimate/EstimateCalculator 2.tsx"
    ["project_copy/src/layouts/MainLayout.tsx"]="project_copy/src/layouts/MainLayout 2.tsx"
    ["project_copy/src/components/projects/ProjectsList.tsx"]="project_copy/src/components/projects/ProjectsList 2.tsx"
    ["project_copy/supabase/migrations/20240702000000_create_projects_table.sql"]="project_copy/supabase/migrations/20240702000000_create_projects_table 2.sql"
    ["project_copy/supabase/migrations/20240102000000_messaging_system.sql"]="project_copy/supabase/migrations/20240102000000_messaging_system 2.sql"
    ["project_copy/supabase/migrations/20240101000000_base_tables.sql"]="project_copy/supabase/migrations/20240101000000_base_tables 2.sql"
    ["project_copy/supabase/seed/gamification_seed.sql"]="project_copy/supabase/seed/gamification_seed 2.sql"
)

# Process each duplicate
for original in "${!duplicates[@]}"; do
    duplicate="${duplicates[$original]}"
    cleanup_duplicate "$original" "$duplicate"
done

# Clean up any files with " 2" in the name
find . -type f -name "* 2.*" | while read -r duplicate; do
    original="${duplicate/ 2./\.}"
    if [ -f "$original" ]; then
        cleanup_duplicate "$original" "$duplicate"
    fi
done

# Clean up backup files
find . -type f -name "*.bak" -o -name "*.bak[0-9]" | while read -r backup_file; do
    echo -e "${YELLOW}Backing up: $backup_file${NC}"
    cp "$backup_file" "$BACKUP_DIR/$(basename "$backup_file")"
    echo -e "${YELLOW}Removing: $backup_file${NC}"
    rm "$backup_file"
done

# Clean up placeholder files that are no longer needed
placeholder_files=(
    "src/components/users/UsersList.tsx"
    "src/components/disputes/DisputesList.tsx"
    "src/components/verifications/VerificationsList.tsx"
    "src/components/rfp/RFPList.tsx"
    "src/components/partners/TradePartnersList.tsx"
    "src/components/documents/DocumentsList.tsx"
    "src/components/projects/PunchlistItems.tsx"
    "src/components/messaging/MessagePreview.tsx"
)

for file in "${placeholder_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}Creating placeholder for: $file${NC}"
        mkdir -p "$(dirname "$file")"
        
        # Create a simple placeholder component
        cat > "$file" << EOF
import React from 'react';

interface Props {
  limit?: number;
  status?: string;
}

const $(basename "$file" .tsx): React.FC<Props> = ({ limit = 5, status }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg text-center">
      <p className="text-gray-500">This component is a placeholder and will be implemented in a future update.</p>
    </div>
  );
};

export default $(basename "$file" .tsx);
EOF
    fi
done

echo -e "\n${GREEN}Cleanup complete!${NC}"
echo -e "${YELLOW}Backups stored in: $BACKUP_DIR${NC}"
echo -e "${YELLOW}Please review the backups before deleting them.${NC}"

# Final recommendations
echo -e "\n${GREEN}=== Recommended Next Steps ===${NC}"
echo -e "1. Review the backups in $BACKUP_DIR"
echo -e "2. Run your test suite to ensure nothing was broken"
echo -e "3. Commit the changes to version control"
