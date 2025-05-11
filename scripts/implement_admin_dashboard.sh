#!/bin/bash

# Create directories if they don't exist
mkdir -p src/components/admin
mkdir -p src/pages/admin

# Run the generator script
node scripts/generate_admin_dashboard.js

# Run the fix script for DashboardStats
node scripts/fix_dashboard_stats.js

# Run the implementation scripts for all components
node scripts/implement_booking_stats_card.js
node scripts/implement_revenue_stats_card.js
node scripts/implement_service_stats_card.js
node scripts/implement_warranty_stats_card.js
node scripts/implement_recent_activity_list.js

# Run the implementation script for AdminDashboardPage
node scripts/implement_admin_dashboard_page.js

echo "Admin Dashboard implementation complete!"
