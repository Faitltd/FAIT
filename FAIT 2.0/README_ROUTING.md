# FAIT 2.0 Routing Fix

This document explains how to fix the routing issues in the FAIT 2.0 platform.

## Problem

The FAIT 2.0 platform has routing issues where the register, services, and login routes return 404 errors when accessed directly, while the home route works correctly.

## Solution

The solution involves configuring the server to handle client-side routing correctly. This is done by serving the index.html file for all routes, except for static files.

## Available Scripts

### Development Server

To run the Vite development server with the custom middleware:

```bash
./run-vite-dev.sh
```

This will start the Vite development server on port 3000 with the custom middleware that handles all routes correctly.

### Static Server

To run the static server:

```bash
./run-static.sh
```

This will start the static server on port 3002 that serves the application and handles all routes correctly.

### Production Server

To build and serve the application for production:

```bash
./serve.sh
```

This will build the application and start the production server on port 3000 that serves the application and handles all routes correctly.

## How It Works

### Vite Development Server

The Vite development server is configured to handle client-side routing using the `historyApiFallback` option in the Vite configuration. Additionally, a custom middleware is added to ensure all routes are handled correctly.

### Static Server

The static server is an Express server that serves the application and handles all routes by serving the index.html file for all routes, except for static files.

### Production Server

The production server is an Express server that serves the built application from the dist directory and handles all routes by serving the index.html file for all routes, except for static files.

## Troubleshooting

If you encounter any issues with the routing, try the following:

1. Make sure the server is running
2. Check the browser console for any errors
3. Try accessing the routes directly in the browser
4. Try clicking on the links on the home page

If the issues persist, try running the static server or the production server instead of the Vite development server.
