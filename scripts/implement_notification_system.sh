#!/bin/bash

# Create directories if they don't exist
mkdir -p src/components/notifications
mkdir -p src/pages/notifications
mkdir -p src/api
mkdir -p supabase/migrations

# Copy the notification components
echo "Creating notification components..."
cp -f src/components/notifications/NotificationBell.jsx src/components/notifications/NotificationBell.jsx
cp -f src/components/notifications/NotificationItem.jsx src/components/notifications/NotificationItem.jsx

# Copy the notification pages
echo "Creating notification pages..."
cp -f src/pages/notifications/NotificationsPage.jsx src/pages/notifications/NotificationsPage.jsx

# Copy the API files
echo "Creating API files..."
cp -f src/api/notificationsApi.js src/api/notificationsApi.js

# Copy the database migration
echo "Creating database migration..."
cp -f supabase/migrations/20240102000000_notification_system.sql supabase/migrations/20240102000000_notification_system.sql

echo "Notification system implementation complete!"
