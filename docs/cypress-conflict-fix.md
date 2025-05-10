# Fixing Cypress Configuration Conflict

This document explains how to fix the Cypress configuration conflict in this project.

## The Issue

The project was encountering the following error when running Cypress tests:

```
Error
Could not load a Cypress configuration file because there are multiple matches.

We've found 2 Cypress configuration files named cypress.config.cjs, cypress.config.js at the location below:

/Users/raymondkinneiii/Desktop/project 2 copy 3

Please delete the conflicting configuration files.
```

This error occurs because there are two Cypress configuration files in the project:
1. `cypress.config.cjs` - Using CommonJS syntax
2. `cypress.config.js` - Using ES Module syntax

## The Solution

The solution was to:

1. Keep only the `cypress.config.js` file (using ES Module syntax), which is compatible with the project's `"type": "module"` setting in `package.json`.
2. Merge any important configurations from `cypress.config.cjs` into `cypress.config.js`.
3. Remove the `cypress.config.cjs` file to avoid conflicts.

## How to Apply the Fix

You can fix the Cypress configuration conflict by running:

```bash
npm run cypress:fix
```

Or manually:

```bash
./fix-cypress-conflict.sh
```

This script will remove the conflicting `cypress.config.cjs` file.

## Running Cypress Tests

After fixing the configuration conflict, you can run Cypress tests using:

```bash
# Open Cypress Test Runner
npm run cypress:open

# Run Cypress tests in headless mode
npm run cypress:run
```

These commands will automatically fix any configuration conflicts before running Cypress.

## Troubleshooting

If you encounter the configuration conflict error again, it means that the `cypress.config.cjs` file has been recreated. This could happen if:

1. You've pulled changes from a repository that includes this file
2. You've restored the file from a backup
3. You've run a script that creates this file

In any case, you can fix the issue by running `npm run cypress:fix` again.
