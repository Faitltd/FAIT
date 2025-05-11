#!/bin/bash

# Script to run all the SQL login issue tests

echo "=== Installing required Node.js packages ==="
npm install @supabase/supabase-js

echo ""
echo "=== Running authentication tests ==="
node test_auth.js

echo ""
echo "=== Tests complete ==="
echo "If you encountered any issues, you can run the database fixes with:"
echo "node run_db_fixes.js"
