#!/bin/bash

# FAIT SvelteKit Conversion Script
# This script converts the project from React to SvelteKit in chunks

set -e

echo "🚀 Starting FAIT SvelteKit Conversion..."

# Step 1: Update Supabase Configuration
echo "📝 Step 1: Updating Supabase configuration for FAIT..."
node scripts/update-supabase-config.js

# Step 2: Clean up React components
echo "🧹 Step 2: Cleaning up React components..."
node scripts/cleanup-react-components.js

# Step 3: Convert core components to Svelte
echo "🔄 Step 3: Converting core components to Svelte..."
node scripts/convert-components.js

# Step 4: Update routing structure
echo "🛣️  Step 4: Setting up SvelteKit routing..."
node scripts/setup-sveltekit-routes.js

# Step 5: Update imports and references
echo "🔗 Step 5: Updating imports and references..."
node scripts/update-imports.js

# Step 6: Test the conversion
echo "🧪 Step 6: Testing the conversion..."
npm run check
npm run build

echo "✅ SvelteKit conversion completed successfully!"
echo "🎯 Next steps:"
echo "   - Run 'npm run dev' to start development server"
echo "   - Run 'npm run test' to execute tests"
echo "   - Check http://localhost:5173 for the FAIT platform"
