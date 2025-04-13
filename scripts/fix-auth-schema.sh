#!/bin/bash

# Script to fix the auth schema issue with email_change column

echo "Applying database migration to fix auth schema..."
supabase db push

echo "Restarting Supabase services..."
supabase stop
supabase start

echo "Schema fix applied successfully!"
echo "You can now try the OAuth login again."
