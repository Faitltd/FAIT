#!/bin/bash

# Apply the base migrations first (2025 dates)
echo "Applying base migrations..."
for migration in $(ls -1 supabase/migrations/2025*.sql | sort); do
  echo "Applying $migration..."
  docker exec -i supabase_db_project_2 psql -U postgres -d postgres < $migration
done

# Apply the feature migrations (2024 dates)
echo "Applying feature migrations..."
for migration in $(ls -1 supabase/migrations/2024*.sql | sort); do
  echo "Applying $migration..."
  docker exec -i supabase_db_project_2 psql -U postgres -d postgres < $migration
done

echo "Migrations applied successfully!"
