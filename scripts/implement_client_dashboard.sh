#!/bin/bash

# Create directories if they don't exist
mkdir -p src/components/client
mkdir -p src/pages/dashboard

# Run the generator script
node scripts/generate_client_dashboard.js

# Run the implementation scripts for all components
node scripts/implement_client_dashboard_stats.js
node scripts/implement_booking_history_card.js
node scripts/implement_upcoming_bookings_card.js
node scripts/implement_active_warranties_card.js
node scripts/implement_service_search_card.js
node scripts/implement_recent_messages_card.js

echo "Client Dashboard implementation complete!"
