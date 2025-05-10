# Black Screen Troubleshooting Guide

This guide provides a systematic approach to diagnose and fix the black screen issue in the FAIT 2.0 project.

## Diagnostic Tools

We've created several diagnostic tools to help identify the cause of the black screen issue:

1. **Static Test Page**: A simple HTML page to verify if the server can serve static content correctly
   - Access at: http://localhost:3001/test.html

2. **Simple Node.js Server (ES Module)**: An alternative server that doesn't rely on Vite
   - Run with: `./run-simple-server.sh`
   - Useful when there are issues with Vite or module resolution

3. **Simple Node.js Server (CommonJS)**: An alternative server that uses CommonJS syntax
   - Run with: `./run-simple-server-cjs.sh`
   - Useful when there are issues with ES Module compatibility

4. **Basic Node.js Server**: A minimal server with no module system dependencies
   - Run with: `./run-basic-server.sh`
   - Useful when there are both ES Module and CommonJS compatibility issues

5. **CSS Diagnostic Tool**: A specialized tool to identify CSS and styling issues
   - Access at: http://localhost:3001/css-diagnostic.html
   - Run with: `./run-css-diagnostic.sh`

6. **Debug Index Page**: An enhanced version of index.html with debugging capabilities
   - Run with: `./start-debug-server.sh`

7. **Fixed Components**: Modified versions of the React components with forced visibility
   - Run with: `./run-fixed-app.sh`

8. **Console Error Check**: A Cypress test to check for JavaScript errors in the browser console
   - Run with: `./run-console-check.sh`

## Step-by-Step Troubleshooting

### Step 1: Verify Server Functionality

1. Run the static test server:
   ```
   ./start-test-server.sh
   ```

2. If you encounter issues with Vite or module resolution, try the simple Node.js server (ES Module) instead:
   ```
   ./run-simple-server.sh
   ```

3. If you encounter ES Module compatibility issues, try the simple Node.js server (CommonJS) instead:
   ```
   ./run-simple-server-cjs.sh
   ```

4. If you encounter both module system issues, try the basic Node.js server instead:
   ```
   ./run-basic-server.sh
   ```

5. Access the static test page:
   http://localhost:3001/test.html

6. If the static test page loads correctly, the server is functioning properly.
   If not, there might be issues with the server configuration.

### Step 2: Check for CSS Issues

1. Run the CSS diagnostic tool:
   ```
   ./run-css-diagnostic.sh
   ```

2. Use the tool to:
   - Analyze stylesheets for problematic rules
   - Check for elements with visibility issues
   - Analyze z-index values
   - Diagnose the root element
   - Test CSS reset

3. Look for:
   - Elements with black backgrounds
   - Elements with display: none, visibility: hidden, or opacity: 0
   - Elements with high z-index that might be covering content

### Step 3: Check for JavaScript Errors

1. Run the console error check:
   ```
   ./run-console-check.sh
   ```

2. Review the Cypress test results for:
   - JavaScript errors in the console
   - React-specific errors
   - Uncaught exceptions
   - Unhandled promise rejections

### Step 4: Test with Fixed Components

1. Run the application with fixed components:
   ```
   ./run-fixed-app.sh
   ```

2. If the application renders correctly with the fixed components, the issue is likely related to:
   - CSS/styling issues in the original components
   - React rendering configuration

3. If the application still shows a black screen, the issue might be more fundamental:
   - JavaScript errors preventing React from initializing
   - Build configuration issues
   - Incompatible dependencies

### Step 5: Debug with Enhanced Index

1. Run the debug server:
   ```
   ./start-debug-server.sh
   ```

2. Use the debug tools to:
   - Check the root element properties
   - Inspect the DOM structure
   - Monitor console output
   - Test forced rendering

## Common Causes and Solutions

### 1. CSS Issues

**Symptoms:**
- Page structure loads but content is not visible
- Elements have zero width/height or are positioned off-screen
- Black background covering content

**Solutions:**
- Reset problematic CSS rules
- Check for elements with black backgrounds
- Verify z-index stacking
- Check for elements with visibility: hidden or display: none

### 2. JavaScript Errors

**Symptoms:**
- Console errors in the browser
- React fails to initialize
- Blank or partially rendered page

**Solutions:**
- Fix JavaScript syntax errors
- Resolve missing dependencies
- Check for React version compatibility issues
- Verify import/export statements

### 3. React Rendering Issues

**Symptoms:**
- Root element exists but has no children
- React mounts but doesn't render
- StrictMode causing double rendering issues

**Solutions:**
- Check React component structure
- Verify root element configuration
- Test with StrictMode disabled
- Check for conditional rendering issues

### 4. Build Configuration Issues

**Symptoms:**
- Assets not being served correctly
- Missing or incorrect file paths
- Environment variables not set properly
- Module resolution errors (ERR_MODULE_NOT_FOUND)

**Solutions:**
- Verify Vite configuration
- Check build output
- Test with different port configurations
- Verify environment variables
- Try using the simple Node.js server (ES Module) instead of Vite
- If you encounter ES Module compatibility issues, try the simple Node.js server (CommonJS)
- If you encounter both module system issues, try the basic Node.js server
- Check for Node.js version compatibility issues

## Next Steps After Resolution

Once the black screen issue is resolved:

1. Update the Cypress configuration to match the working environment
2. Run the basic tests to verify functionality
3. Implement comprehensive tests for the application
4. Set up CI/CD integration for automated testing
5. Document the solution for future reference

## Additional Resources

- Cypress Documentation: https://docs.cypress.io/
- React Debugging: https://reactjs.org/docs/error-boundaries.html
- Vite Documentation: https://vitejs.dev/guide/
- Browser DevTools Guide: https://developer.chrome.com/docs/devtools/
- Node.js Module Resolution: https://nodejs.org/api/modules.html#modules_all_together
