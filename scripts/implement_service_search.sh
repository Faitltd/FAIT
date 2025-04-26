#!/bin/bash

# Create directories if they don't exist
mkdir -p src/components/services
mkdir -p src/pages/services
mkdir -p src/api

# Copy the service search components
echo "Creating service search components..."
cp -f src/components/services/ServiceSearchFilters.jsx src/components/services/ServiceSearchFilters.jsx
cp -f src/components/services/ServiceSearchResults.jsx src/components/services/ServiceSearchResults.jsx
cp -f src/components/services/ServiceSearchMap.jsx src/components/services/ServiceSearchMap.jsx

# Copy the service search page
echo "Creating service search page..."
cp -f src/pages/services/ServiceSearchPage.jsx src/pages/services/ServiceSearchPage.jsx

# Copy the API files
echo "Creating API files..."
cp -f src/api/servicesApi.js src/api/servicesApi.js
cp -f src/api/geocodingApi.js src/api/geocodingApi.js

echo "Service search implementation complete!"
