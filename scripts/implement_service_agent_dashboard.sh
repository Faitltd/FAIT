#!/bin/bash

# Create directories if they don't exist
mkdir -p src/components/service-agent
mkdir -p src/pages/dashboard

# Run the generator script
node scripts/generate_service_agent_dashboard.js

echo "Service Agent Dashboard implementation complete!"
