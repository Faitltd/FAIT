#!/bin/bash
set -e

# Get the absolute path to the stripe-webhook-service directory
SERVICE_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# Create a temporary file for the crontab
TEMP_CRONTAB=$(mktemp)

# Export the current crontab
crontab -l > "$TEMP_CRONTAB" 2>/dev/null || echo "# New crontab" > "$TEMP_CRONTAB"

# Check if the cron job already exists
if ! grep -q "cleanup:events" "$TEMP_CRONTAB"; then
  # Add the cron job to run at midnight every day
  echo "# Cleanup processed events at midnight every day" >> "$TEMP_CRONTAB"
  echo "0 0 * * * cd $SERVICE_DIR && npm run cleanup:events" >> "$TEMP_CRONTAB"
  
  # Install the new crontab
  crontab "$TEMP_CRONTAB"
  
  echo "✅ Cron job installed successfully!"
else
  echo "ℹ️ Cron job already exists."
fi

# Clean up
rm "$TEMP_CRONTAB"
