# FAIT 2.0 Black Screen Diagnostic Tools

This directory contains a suite of diagnostic tools to help identify and fix the black screen issue in the FAIT 2.0 project.

## Quick Start

Run the master diagnostic script to access all tools:

```bash
./run-all-diagnostics.sh
```

This will present a menu of all available diagnostic tools.

## Available Tools

### 1. Static Test Server
Tests if the server can serve static content correctly.

```bash
./start-test-server.sh
```

This will:
- Start a server on port 3001
- Serve a static test page at http://localhost:3001/test.html
- Allow you to verify if basic HTML content is displayed correctly

### 2. Simple Node.js Server (ES Module)
An alternative server that doesn't rely on Vite, using ES Module syntax.

```bash
./run-simple-server.sh
```

This will:
- Start a simple Node.js HTTP server on port 3001 using ES Module syntax
- Serve static files from the project directory
- Avoid Vite-related module resolution issues

### 3. Simple Node.js Server (CommonJS)
An alternative server that uses CommonJS syntax, useful when there are ES Module compatibility issues.

```bash
./run-simple-server-cjs.sh
```

This will:
- Start a simple Node.js HTTP server on port 3001 using CommonJS syntax
- Serve static files from the project directory
- Avoid both Vite-related and ES Module-related issues

### 4. Basic Node.js Server
A minimal server with no module system dependencies, useful when there are both ES Module and CommonJS compatibility issues.

```bash
./run-basic-server.sh
```

This will:
- Start a minimal Node.js HTTP server on port 3001 with no module system dependencies
- Serve static files from the project directory
- Avoid all module-related issues

### 5. CSS Diagnostic Tool
Helps identify CSS and styling issues that might cause the black screen.

```bash
./run-css-diagnostic.sh
```

This will:
- Start a server on port 3001
- Serve a CSS diagnostic tool at http://localhost:3001/css-diagnostic.html
- Provide tools to analyze stylesheets, check element visibility, and test CSS resets

### 6. Debug Server
Runs the application with an enhanced debugging index.html.

```bash
./start-debug-server.sh
```

This will:
- Replace the standard index.html with a debug version
- Start a server on port 3001
- Provide additional debugging tools in the browser

### 7. Fixed App
Runs the application with modified React components that force visibility.

```bash
./run-fixed-app.sh
```

This will:
- Replace the standard React components with versions that force visibility
- Start a server on port 3001
- Help determine if the issue is related to CSS or React rendering

### 8. Console Error Check
Runs Cypress tests to check for JavaScript errors in the browser console.

```bash
./run-console-check.sh
```

This will:
- Run Cypress tests that capture console errors
- Generate screenshots and reports
- Help identify JavaScript errors that might be causing the black screen

### 9. Basic Cypress Tests
Runs a suite of basic Cypress tests to check rendering.

```bash
./run-basic-tests.sh
```

This will:
- Run a suite of basic Cypress tests
- Check for various rendering issues
- Generate screenshots and reports

### 10. Troubleshooting Guide
A comprehensive guide to diagnosing and fixing the black screen issue.

```bash
# Open the guide
open BLACK_SCREEN_TROUBLESHOOTING.md
```

## Individual Test Files

### Static Test Page
A simple HTML page to verify if the server can serve static content correctly.
- File: `test.html`
- Access at: http://localhost:3001/test.html

### Simple Node.js Server (ES Module)
A basic HTTP server that serves static files using ES Module syntax.
- File: `simple-server.mjs`
- Run with: `./run-simple-server.sh`

### Simple Node.js Server (CommonJS)
A basic HTTP server that serves static files using CommonJS syntax.
- File: `simple-server.cjs`
- Run with: `./run-simple-server-cjs.sh`

### Basic Node.js Server
A minimal HTTP server with no module system dependencies.
- File: `basic-server.js`
- Run with: `./run-basic-server.sh`

### CSS Diagnostic Tool
A specialized tool to identify CSS and styling issues.
- File: `css-diagnostic.html`
- Access at: http://localhost:3001/css-diagnostic.html

### Debug Index Page
An enhanced version of index.html with debugging capabilities.
- File: `debug-index.html`

### Fixed Components
Modified versions of the React components with forced visibility.
- Files: `FixedTestApp.tsx`, `FixedMain.tsx`

### Cypress Tests
Various Cypress tests to diagnose rendering issues.
- Files in `cypress/e2e/`:
  - `static-test-page.cy.js`: Tests the static test page
  - `basic-app-check.cy.js`: Basic application checks
  - `app-content-check.cy.js`: Checks for content elements
  - `app-loading-check.cy.js`: Checks application loading
  - `css-debug.cy.js`: Checks for CSS issues
  - `route-check.cy.js`: Checks various routes
  - `interaction-test.cy.js`: Tests user interactions
  - `console-errors.cy.js`: Checks for JavaScript errors

## Troubleshooting Process

1. Start with the static test server to verify basic server functionality
   - If you encounter Vite module resolution issues, use the simple Node.js server (ES Module) instead
   - If you encounter ES Module compatibility issues, use the simple Node.js server (CommonJS) instead
   - If you encounter both module system issues, use the basic Node.js server instead
2. Use the CSS diagnostic tool to identify styling issues
3. Check for JavaScript errors with the console error check
4. Try the fixed app to see if forced visibility resolves the issue
5. Use the debug server for more detailed analysis
6. Run the basic Cypress tests to gather more information
7. Consult the troubleshooting guide for solutions

## Common Issues and Solutions

### Vite Module Resolution Error
If you see an error like:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/path/to/node_modules/dist/node/cli.js'
```

This indicates an issue with Vite's module resolution. Try:
1. Using the simple Node.js server (ES Module) instead: `./run-simple-server.sh`
2. Reinstalling Vite: `npm install vite@latest`
3. Checking Node.js version compatibility

### ES Module Compatibility Error
If you see an error like:
```
ReferenceError: require is not defined in ES module scope, you can use import instead
```

This indicates an issue with ES Module compatibility. Try:
1. Using the simple Node.js server (CommonJS) instead: `./run-simple-server-cjs.sh`
2. Check the "type" field in package.json (it's likely set to "module")
3. Use .mjs extension for ES modules and .cjs for CommonJS modules

### General Module System Issues
If you encounter both Vite module resolution issues and ES Module compatibility issues, try:
1. Using the basic Node.js server instead: `./run-basic-server.sh`
2. This server uses a minimal approach that avoids module system dependencies
3. It should work regardless of the project's module configuration

### Black Screen with No Console Errors
If the application shows a black screen but there are no console errors:
1. Use the CSS diagnostic tool to check for styling issues
2. Try the fixed app with forced visibility styles
3. Check for elements with black backgrounds or zero opacity

## After Resolving the Issue

Once the black screen issue is resolved:

1. Update the Cypress configuration to match the working environment
2. Run the comprehensive test suite
3. Implement CI/CD integration
4. Document the solution

## Need Help?

Refer to the comprehensive troubleshooting guide:
- `BLACK_SCREEN_TROUBLESHOOTING.md`
