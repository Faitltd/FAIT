# Project Migration Guide

This guide explains how to migrate existing FAIT projects into the monorepo structure.

## General Steps for All Projects

1. Copy the project files into the appropriate directory in the monorepo
2. Update the project's package.json to include shared dependencies
3. Update the project's configuration files (Tailwind, TypeScript, etc.)
4. Test the project to ensure it works within the monorepo

## Specific Steps for Each Project Type

### Vue.js Projects (FAIT Coop)

1. Copy the project files to `apps/fait-coop/`
2. Update package.json:
   - Add dependencies on shared packages (`@fait/auth`, `@fait/ui`, `@fait/utils`)
   - Add dev dependency on `@fait/config`
3. Update tailwind.config.js to use the shared preset:
   ```js
   const sharedConfig = require('@fait/config/tailwind.preset');
   module.exports = {
     presets: [sharedConfig],
     // App-specific config here
   };
   ```
4. Update tsconfig.json to extend the base config:
   ```json
   {
     "extends": "../../tsconfig.base.json",
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"],
         "@fait/*": ["../../packages/*"]
       }
     }
   }
   ```
5. Update imports to use shared packages where appropriate

### Next.js Projects (OfferShield, HomeHealthScore)

1. Copy the project files to the appropriate directory (e.g., `apps/offershield/`)
2. Update package.json:
   - Add dependencies on shared packages (`@fait/auth`, `@fait/ui`, `@fait/utils`)
   - Add dev dependency on `@fait/config`
3. Update tailwind.config.js to use the shared preset (same as Vue.js projects)
4. Update tsconfig.json to extend the base config (same as Vue.js projects)
5. Update imports to use shared packages where appropriate

### Static HTML/JS Projects (Handyman Calculator)

1. Copy the project files to the appropriate directory (e.g., `apps/handyman-calculator/`)
2. If the project uses npm, update package.json to include shared dependencies
3. If the project uses Tailwind, update the configuration to use the shared preset
4. Update script imports to use shared packages where appropriate

### Tools (Home Depot Scraper)

1. Copy the project files to `tools/home-depot-scraper/`
2. Update package.json to include any shared dependencies
3. Update configuration files as needed

## Using Shared Packages

### Authentication (@fait/auth)

```js
// Before
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// After
import { supabase } from '@fait/auth';
```

### UI Components (@fait/ui)

```js
// Before
import Button from '../components/Button';

// After
import { Button } from '@fait/ui';
```

### Utility Functions (@fait/utils)

```js
// Before
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

// After
import { formatCurrency } from '@fait/utils';
```

## Testing Your Migration

After migrating a project, test it by running:

```bash
cd fait-mono
npm run dev -- --filter=<project-name>
```

For example, to test the FAIT Coop project:

```bash
npm run dev -- --filter=fait-coop
```
