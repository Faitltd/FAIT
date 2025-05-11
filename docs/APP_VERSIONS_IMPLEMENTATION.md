# App Versions Implementation

## Overview

This document describes the implementation of the multi-version app architecture for the FAIT Co-op platform. This approach allows for easier development, testing, and debugging by isolating components and features.

## Implementation Details

### 1. App Version Components

We've created four different app versions with increasing complexity:

1. **SimpleTestApp**: A minimal test app with basic login functionality
2. **MinimalApp**: A simplified version with core navigation and basic pages
3. **EnhancedMinimalApp**: Includes more providers and components
4. **FullApp**: The complete application with all features

### 2. Version Selection in main.tsx

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

### 3. Version Indicator Component

We've added a version indicator component (`AppVersionIndicator.tsx`) that:

- Shows which version of the app is currently running
- Provides links to switch between versions
- Can be expanded to show more information
- Can be hidden if not needed

### 4. NPM Scripts

We've added npm scripts to run different app versions:

```json
"dev:simple": "vite --mode simple",
"dev:minimal": "VITE_APP_VERSION=minimal vite",
"dev:enhanced": "VITE_APP_VERSION=enhanced vite",
"dev:full": "VITE_APP_VERSION=full vite",
"dev:versions": "./run-app-versions.sh",
```

### 5. Testing

We've updated the Cypress tests to verify that each app version loads correctly and includes the version indicator.

### 6. Documentation

We've added comprehensive documentation:

- `APP_VERSIONS.md`: Overview of the app versions and how to use them
- `APP_VERSIONS_IMPLEMENTATION.md`: Technical details of the implementation
- Updated `README.md` with information about the app versions

## Benefits

This implementation provides several benefits:

1. **Easier Debugging**: When issues occur, developers can start with the simplest version and gradually add complexity to identify the source of the problem.

2. **Faster Development**: New features can be developed and tested in isolation before being integrated into the full app.

3. **Better Testing**: Each app version can be tested independently, making it easier to identify and fix issues.

4. **Improved User Experience**: The version indicator makes it clear which version is running and allows for easy switching between versions.

## Future Improvements

Potential future improvements include:

1. **Feature Flags**: Add feature flags to enable/disable specific features within each app version.

2. **Performance Metrics**: Add performance metrics to compare the different app versions.

3. **Automated Testing**: Expand automated testing to cover more scenarios in each app version.

4. **Documentation**: Continue to improve documentation with more examples and use cases.
