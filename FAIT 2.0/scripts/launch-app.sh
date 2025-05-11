#!/bin/bash

# Set environment variables if not using .env file
# export VITE_SUPABASE_URL=your-supabase-url
# export VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Install dependencies if needed
echo "Installing dependencies..."
npm install

# Build the app (for production)
echo "Building the app..."
npm run build

# Start the development server (for development)
echo "Starting the development server..."
npm run dev

# For production, you might use:
# npm run start