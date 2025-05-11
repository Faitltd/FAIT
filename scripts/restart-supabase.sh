#!/bin/bash

# Script to restart Supabase with updated configuration

echo "Stopping Supabase..."
supabase stop

echo "Starting Supabase with updated configuration..."
supabase start

echo "Supabase restarted successfully!"
echo "You can now test the OAuth login functionality."
