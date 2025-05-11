# FAIT Co-op App Versions

## Overview

The FAIT Co-op platform supports multiple app versions with different levels of complexity. This approach allows for easier development, testing, and debugging by isolating components and features.

## Available Versions

### 1. Simple Test App (`?version=simple`)

A minimal test application with basic login functionality.

- **Features**:
  - Simple login form
  - Minimal styling
  - No navigation or complex components
  - Useful for testing authentication in isolation

- **Usage**:
  - Development: `npm run dev:simple` or `npm run dev` and navigate to `/?version=simple`
  - Production build: `npm run build:simple`

### 2. Minimal App (`?version=minimal`)

A simplified version with core navigation and basic pages.

- **Features**:
  - Basic navigation with Navbar
  - Home, Login, and Register pages
  - AuthProvider context
  - Footer component

- **Usage**:
  - Development: `npm run dev:minimal` or `npm run dev` and navigate to `/?version=minimal`
  - Production build: `npm run build:minimal`

### 3. Enhanced Minimal App (`?version=enhanced`)

Includes more providers and components for a more complete experience.

- **Features**:
  - All features from Minimal App
  - Additional context providers (Subscription, DirectAuth, SystemMessage)
  - Error boundary
  - Toast notifications
  - Google Maps integration
  - Authentication mode selection

- **Usage**:
  - Development: `npm run dev:enhanced` or `npm run dev` and navigate to `/?version=enhanced`
  - Production build: `npm run build:enhanced`

### 4. Full App (`?version=full`)

The complete application with all features.

- **Features**:
  - All features from Enhanced Minimal App
  - Complete routing system
  - Dashboard pages (Admin, Client, Service Agent)
  - Service search and booking
  - Messaging system
  - Warranty claims
  - Project management
  - And more...

- **Usage**:
  - Development: `npm run dev:full` or `npm run dev` and navigate to `/?version=full`
  - Production build: `npm run build:full`

## Implementation Details

The app version selection is implemented in `src/main.tsx`:

```typescript
// Get the app version from URL parameters or environment variable
const urlParams = new URLSearchParams(window.location.search);
const defaultVersion = import.meta.env.VITE_APP_VERSION || 'enhanced';
const appVersion = urlParams.get('version') || defaultVersion;

// Select the app component based on the version parameter
const getAppComponent = () => {
  switch (appVersion) {
    case 'simple':
      return <SimpleTestApp />;
    case 'minimal':
      return <MinimalApp />;
    case 'enhanced':
      return <EnhancedMinimalApp />;
    case 'full':
      return <App />;
    default:
      return <EnhancedMinimalApp />;
  }
};
```

## Testing

To test all app versions:

```bash
npm run test:app-versions
```

This script will:
1. Start the development server
2. Run Cypress tests for all app versions
3. Shut down the server when tests are complete

## Troubleshooting

If you encounter rendering issues:

1. Try a different app version (start with the simplest one)
2. Check the browser console for errors
3. Verify that all required components are available

## Development Strategy

When adding new features:

1. Start by implementing them in the Minimal or Enhanced Minimal App
2. Test thoroughly before integrating into the Full App
3. Update tests to cover the new functionality
