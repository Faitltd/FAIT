#!/bin/bash

# Script to help migrate a React app to SvelteKit
# Usage: ./migrate-to-sveltekit.sh <app-name>

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if app name is provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: App name is required${NC}"
  echo "Usage: ./migrate-to-sveltekit.sh <app-name>"
  exit 1
fi

APP_NAME=$1
SVELTEKIT_APP_NAME="${APP_NAME}-sveltekit"

# Check if the React app exists
if [ ! -d "apps/${APP_NAME}" ]; then
  echo -e "${RED}Error: App '${APP_NAME}' not found in apps directory${NC}"
  exit 1
fi

# Check if the SvelteKit app already exists
if [ -d "apps/${SVELTEKIT_APP_NAME}" ]; then
  echo -e "${YELLOW}Warning: SvelteKit app '${SVELTEKIT_APP_NAME}' already exists${NC}"
  read -p "Do you want to overwrite it? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration aborted"
    exit 1
  fi
  rm -rf "apps/${SVELTEKIT_APP_NAME}"
fi

echo -e "${GREEN}Creating SvelteKit app structure for ${APP_NAME}...${NC}"

# Create directory structure
mkdir -p "apps/${SVELTEKIT_APP_NAME}/src/lib/components"
mkdir -p "apps/${SVELTEKIT_APP_NAME}/src/lib/utils"
mkdir -p "apps/${SVELTEKIT_APP_NAME}/src/routes"
mkdir -p "apps/${SVELTEKIT_APP_NAME}/static"

# Copy configuration files from template
echo -e "${GREEN}Copying configuration files from template...${NC}"
cp packages/sveltekit-template/{svelte.config.js,vite.config.js,tsconfig.json,tailwind.config.js,postcss.config.js} "apps/${SVELTEKIT_APP_NAME}/"

# Copy basic app structure
echo -e "${GREEN}Copying basic app structure...${NC}"
cp packages/sveltekit-template/src/app.html packages/sveltekit-template/src/app.css "apps/${SVELTEKIT_APP_NAME}/src/"

# Create package.json
echo -e "${GREEN}Creating package.json...${NC}"
cat > "apps/${SVELTEKIT_APP_NAME}/package.json" << EOF
{
  "name": "${SVELTEKIT_APP_NAME}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "lint": "eslint ."
  },
  "devDependencies": {
    "@sveltejs/adapter-auto": "^3.1.1",
    "@sveltejs/kit": "^2.5.0",
    "@sveltejs/vite-plugin-svelte": "^3.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "autoprefixer": "^10.4.18",
    "eslint": "^8.56.0",
    "eslint-plugin-svelte": "^2.35.1",
    "postcss": "^8.4.35",
    "svelte": "^4.2.12",
    "svelte-check": "^3.6.3",
    "tailwindcss": "^3.4.1",
    "tslib": "^2.6.2",
    "typescript": "^5.3.3",
    "vite": "^5.1.4"
  },
  "dependencies": {
    "@fait/sveltekit-ui": "workspace:*",
    "@supabase/supabase-js": "^2.39.7",
    "date-fns": "^3.3.1",
    "lucide-svelte": "^0.344.0",
    "zod": "^3.22.4"
  }
}
EOF

# Create basic layout file
echo -e "${GREEN}Creating basic layout file...${NC}"
cat > "apps/${SVELTEKIT_APP_NAME}/src/routes/+layout.svelte" << EOF
<script>
  import '../app.css';
</script>

<div class="min-h-screen bg-gray-50">
  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <div class="flex items-center">
          <h1 class="text-xl font-bold text-primary-600">${APP_NAME}</h1>
        </div>
        <nav class="flex space-x-4">
          <a href="/" class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Home</a>
        </nav>
      </div>
    </div>
  </header>
  
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <slot />
  </main>
  
  <footer class="bg-white mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <p class="text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} FAIT ${APP_NAME}. All rights reserved.
      </p>
    </div>
  </footer>
</div>
EOF

# Create basic home page
echo -e "${GREEN}Creating basic home page...${NC}"
cat > "apps/${SVELTEKIT_APP_NAME}/src/routes/+page.svelte" << EOF
<script>
  import { Home } from 'lucide-svelte';
  import { Card, Button } from '@fait/sveltekit-ui';
</script>

<div class="text-center">
  <h1 class="text-4xl font-bold text-gray-900 mb-6">${APP_NAME}</h1>
  <p class="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
    This is the SvelteKit version of the ${APP_NAME} app.
  </p>
  
  <Card class="max-w-md mx-auto">
    <div class="flex justify-center mb-4">
      <Home class="w-12 h-12 text-primary-600" />
    </div>
    <h2 class="text-2xl font-semibold mb-3">Welcome!</h2>
    <p class="text-gray-600 mb-4">
      This is a starting point for your migrated SvelteKit application.
    </p>
    <Button variant="primary" fullWidth>Get Started</Button>
  </Card>
</div>
EOF

echo -e "${GREEN}Migration setup complete for ${SVELTEKIT_APP_NAME}!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Migrate your React components to Svelte components"
echo "2. Set up your routes in the src/routes directory"
echo "3. Test your migrated app with 'npm run dev' in the app directory"
echo "4. Update the monorepo configuration if needed"
echo -e "${GREEN}See the REACT_TO_SVELTEKIT_MIGRATION.md guide for more details${NC}"

exit 0
