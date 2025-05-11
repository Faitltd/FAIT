#!/bin/bash

# Create a backup of the file
cp src/pages/dashboard/ServiceAgentDashboard.tsx src/pages/dashboard/ServiceAgentDashboard.tsx.bak

# Replace 'Tool' with 'Wrench' in the import statement
sed -i '' 's/import {.*} from '\''lucide-react'\''/import { Calendar, MessageSquare, Wrench, Users, BarChart3, Settings, LogOut } from '\''lucide-react'\''/' src/pages/dashboard/ServiceAgentDashboard.tsx

# Replace any usage of Tool with Wrench
sed -i '' 's/<Tool/<Wrench/g' src/pages/dashboard/ServiceAgentDashboard.tsx
sed -i '' 's/Tool=/Wrench=/g' src/pages/dashboard/ServiceAgentDashboard.tsx

echo "Fixed Tool import in ServiceAgentDashboard.tsx"
