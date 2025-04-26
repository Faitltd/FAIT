#!/bin/bash

# This script inserts fake data for testing the Pricing and Monetization Subsystem

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker and try again."
  exit 1
fi

# Get the Supabase container ID
CONTAINER_ID=$(docker ps | grep supabase_db | awk '{print $1}')

if [ -z "$CONTAINER_ID" ]; then
  echo "Error: Supabase database container not found. Make sure Supabase is running."
  exit 1
fi

echo "Inserting fake data into Supabase..."

# Copy the SQL file to the container
docker cp scripts/insert_fake_data.sql $CONTAINER_ID:/tmp/

# Execute the SQL file
docker exec $CONTAINER_ID psql -U postgres -d postgres -f /tmp/insert_fake_data.sql

echo "Fake data inserted successfully!"
