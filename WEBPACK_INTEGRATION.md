# Webpack Integration with Vite

This project supports both Vite and Webpack as bundlers. This document explains how to use Webpack alongside Vite and the benefits of having both bundlers available.

## Quick Setup

To ensure your environment is properly set up for webpack development:

```bash
./setup-webpack.sh
```

This script will:
1. Check for required dependencies and install any missing packages
2. Verify that all necessary configuration files exist
3. Offer to start the webpack development server

## Why Use Both Bundlers?

1. **Development Experience**: Vite provides an extremely fast development experience with instant hot module replacement (HMR).
2. **Production Optimization**: Webpack offers mature production optimization capabilities and a rich ecosystem of plugins.
3. **Compatibility**: Some libraries or tools might work better with one bundler over the other.
4. **Flexibility**: Having both bundlers allows you to choose the best tool for specific tasks.
5. **Learning**: You can compare the output and performance of both bundlers.

## Available Scripts

### Vite Scripts

```bash
# Start development server with Vite
npm run dev

# Build for production with Vite
npm run build

# Preview the Vite production build
npm run preview
```

### Webpack Scripts

```bash
# Start development server with Webpack
npm run webpack:dev

# Build for production with Webpack
npm run webpack:build

# Build for production with Webpack and analyze the bundle
npm run webpack:analyze
```

## Key Differences

### Development Server

- **Vite**: Runs on port 5173 by default
- **Webpack**: Runs on port 8080 by default

### Build Output

Both bundlers output to the `dist` directory, but with different file structures:

- **Vite**: Generates hashed filenames and optimizes assets
- **Webpack**: Follows a more traditional structure with separate directories for JS, CSS, and assets

### Entry Points

- **Vite**: Uses `src/main.tsx` as the entry point
- **Webpack**: Uses `src/webpack-entry.tsx` as the entry point

## Configuration Files

- **Vite**: Configuration is in `vite.config.ts`
- **Webpack**: Configuration is in `webpack.config.js`

## Bundle Analysis

To analyze your Webpack bundle size and composition:

```bash
npm run webpack:analyze
# or use the helper script
./analyze-bundle.sh
```

This will build your application and open a visualization of the bundle in your browser.

## Performance Comparison

To compare the build performance of Vite and Webpack:

```bash
./performance-comparison.sh
```

This script will:
1. Build the application with both Vite and Webpack
2. Measure and compare build times
3. Compare bundle sizes
4. Save both builds for further inspection

## When to Use Which Bundler

### Use Vite for:

- Fast development iterations
- Simple projects
- When you need the fastest possible HMR

### Use Webpack for:

- Complex production optimizations
- When you need specific Webpack plugins
- Legacy browser support
- Bundle analysis and optimization

## Switching Between Bundlers

You can easily switch between bundlers without changing your code. Just use the appropriate npm script for the bundler you want to use.

## Notes

- Both bundlers use the same source code, but they have separate entry points to allow for bundler-specific optimizations.
- The HTML templates are slightly different to distinguish between the two bundlers.
- Environment variables work with both bundlers.
