#!/usr/bin/env node

/**
 * Cleanup React Components
 * This script removes React-specific files and components that are no longer needed
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 Cleaning up React components and files...');

// Files and directories to remove (React-specific)
const filesToRemove = [
  'src/App.jsx',
  'src/App.tsx',
  'src/App.subscription.jsx',
  'src/EnhancedMinimalApp.tsx',
  'src/FixedApp.tsx',
  'src/MinimalApp.tsx',
  'src/ModularApp.tsx',
  'src/SimpleApp.jsx',
  'src/SimpleApp.tsx',
  'src/SimpleTestApp.tsx',
  'src/main.tsx',
  'src/simple-main.jsx',
  'src/standalone-app.tsx',
  'src/standalone-app-with-styles.tsx',
  'src/temp-main.tsx',
  'src/temp-main-simple.tsx',
  'src/test-main.tsx',
  'src/test-entry.tsx',
  'src/test-app-versions.tsx',
  'src/webpack-entry.tsx',
  'src/check-components.tsx'
];

// React-specific directories to clean up
const dirsToCleanup = [
  'src/components/auth', // Will be recreated as Svelte components
  'src/components/common', // Will be recreated as Svelte components
  'src/pages' // React pages, will use SvelteKit routes instead
];

// Remove React-specific files
filesToRemove.forEach(filePath => {
  const fullPath = path.join(path.dirname(__dirname), filePath);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`✅ Removed ${filePath}`);
    } catch (error) {
      console.error(`❌ Error removing ${filePath}:`, error.message);
    }
  }
});

// Function to safely remove directory
function removeDirectory(dirPath) {
  const fullPath = path.join(path.dirname(__dirname), dirPath);
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`✅ Removed directory ${dirPath}`);
    } catch (error) {
      console.error(`❌ Error removing directory ${dirPath}:`, error.message);
    }
  }
}

// Clean up React-specific directories
dirsToCleanup.forEach(removeDirectory);

// Remove React-specific webpack configurations
const webpackFiles = [
  'webpack.config.cjs',
  'webpack.dev.cjs',
  'webpack.prod.cjs',
  'webpack.test.cjs',
  'webpack.dashboard.cjs',
  'webpack.pwa.cjs',
  'webpack.perf.js'
];

webpackFiles.forEach(filePath => {
  const fullPath = path.join(path.dirname(__dirname), filePath);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`✅ Removed webpack config ${filePath}`);
    } catch (error) {
      console.error(`❌ Error removing ${filePath}:`, error.message);
    }
  }
});

// Update .gitignore to remove React-specific entries
const gitignorePath = path.join(path.dirname(__dirname), '.gitignore');
if (fs.existsSync(gitignorePath)) {
  let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  
  // Remove React-specific entries and add SvelteKit-specific ones
  const svelteKitGitignore = `
# SvelteKit
.svelte-kit/
build/
.vercel/
.netlify/

# Environment variables
.env
.env.local
.env.production

# Dependencies
node_modules/

# Logs
*.log

# OS generated files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Testing
coverage/
cypress/screenshots/
cypress/videos/
`;

  fs.writeFileSync(gitignorePath, svelteKitGitignore);
  console.log('✅ Updated .gitignore for SvelteKit');
}

console.log('🎯 React cleanup completed');
console.log('📝 Next: Converting components to Svelte format');
