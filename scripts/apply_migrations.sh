#!/bin/bash

# Apply all database migrations for FAIT Co-Op platform

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker and try again."
  exit 1
fi

# Check if the Supabase container is running
if ! docker ps | grep -q supabase_db_project_2; then
  echo "Error: Supabase database container is not running. Please start Supabase and try again."
  exit 1
fi

# Apply the base migrations first (2025 dates)
echo "Applying base migrations..."
for migration in $(ls -1 supabase/migrations/2025*.sql | sort); do
  echo "Applying $migration..."
  docker exec -i supabase_db_project_2 psql -U postgres -d postgres -f /var/lib/postgresql/data/$(basename $migration)
done

# Apply the feature migrations (2024 dates)
echo "Applying feature migrations..."
for migration in $(ls -1 supabase/migrations/2024*.sql | sort); do
  echo "Applying $migration..."
  docker exec -i supabase_db_project_2 psql -U postgres -d postgres -f /var/lib/postgresql/data/$(basename $migration)
done

# Apply the enhanced system migrations (20250420 dates)
echo "Applying enhanced system migrations..."
for migration in $(ls -1 supabase/migrations/20250420*.sql | sort); do
  echo "Applying $migration..."
  docker exec -i supabase_db_project_2 psql -U postgres -d postgres < $migration
done

echo "Migrations applied successfully!"
