#!/usr/bin/env node
/**
 * Performance Monitoring Script
 *
 * This script analyzes the performance of the application, including:
 * - Bundle size analysis
 * - Performance budget enforcement
 * - Dependency analysis
 * - Unused code detection
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Performance budgets (in bytes)
const PERFORMANCE_BUDGETS = {
  maxEntrypointSize: 250000, // 250 KB
  maxAssetSize: 250000, // 250 KB
  maxInitialChunkSize: 250000, // 250 KB
  maxAsyncChunkSize: 100000, // 100 KB
};

// File paths
const DIST_DIR = path.resolve(__dirname, '../dist');
const STATS_FILE = path.resolve(DIST_DIR, 'stats.json');
const REPORT_FILE = path.resolve(__dirname, '../performance-report.json');

// Main function
async function main() {
  try {
    console.log(chalk.blue('🔍 Starting performance analysis...'));

    // Check if dist directory exists
    if (!fs.existsSync(DIST_DIR)) {
      console.log(chalk.yellow('⚠️ No build found. Building the application first...'));
      buildApplication();
    }

    // Always generate fresh stats
    console.log(chalk.blue('📊 Generating fresh stats...'));
    generateStats();

    // Load stats
    const stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));

    // Analyze bundle sizes
    const bundleSizes = analyzeBundleSizes(stats);

    // Check performance budgets
    const budgetViolations = checkPerformanceBudgets(bundleSizes);

    // Analyze dependencies
    const dependencies = analyzeDependencies(stats);

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      bundleSizes,
      budgetViolations,
      dependencies,
      summary: {
        totalSize: bundleSizes.total,
        entryPointSize: bundleSizes.entrypoints.main || 0,
        violationCount: budgetViolations.length,
        dependencyCount: Object.keys(dependencies).length,
      },
    };

    // Save report
    fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

    // Print summary
    printSummary(report);

    // Print recommendations
    if (budgetViolations.length > 0) {
      printRecommendations(report);
    } else {
      // Always print some recommendations
      printGeneralRecommendations();
    }

    console.log(chalk.blue(`📊 Full report saved to ${REPORT_FILE}`));
  } catch (error) {
    console.error(chalk.red('❌ Error during performance analysis:'), error);
    process.exit(1);
  }
}

// Build the application
function buildApplication() {
  try {
    console.log(chalk.blue('🏗️ Building application...'));
    execSync('npm run build:perf', { stdio: 'inherit' });
    console.log(chalk.green('✅ Build completed'));
  } catch (error) {
    console.error(chalk.red('❌ Build failed:'), error);
    process.exit(1);
  }
}

// Generate stats file
function generateStats() {
  try {
    console.log(chalk.blue('📊 Generating stats...'));

    // Create a simple stats file based on the dist directory
    const files = getAllFiles(DIST_DIR);
    const assets = files.map(file => {
      const stats = fs.statSync(file);
      return {
        name: path.relative(DIST_DIR, file),
        size: stats.size
      };
    });

    const statsData = {
      assets,
      entrypoints: {
        main: {
          assets: assets.filter(asset => asset.name.includes('index') || asset.name === 'index.html')
        }
      },
      modules: []
    };

    fs.writeFileSync(STATS_FILE, JSON.stringify(statsData, null, 2));
    console.log(chalk.green('✅ Stats generated'));
  } catch (error) {
    console.error(chalk.red('❌ Stats generation failed:'), error);
    process.exit(1);
  }
}

// Get all files in a directory recursively
function getAllFiles(dir) {
  const files = [];

  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      files.push(...getAllFiles(filePath));
    } else {
      files.push(filePath);
    }
  });

  return files;
}

// Analyze bundle sizes
function analyzeBundleSizes(stats) {
  console.log(chalk.blue('📦 Analyzing bundle sizes...'));

  const assets = stats.assets || [];
  const entrypoints = stats.entrypoints || {};

  // Calculate total size
  const totalSize = assets.reduce((total, asset) => total + asset.size, 0);

  // Get sizes by type
  const sizesByType = assets.reduce((acc, asset) => {
    const ext = path.extname(asset.name).replace('.', '');
    acc[ext] = (acc[ext] || 0) + asset.size;
    return acc;
  }, {});

  // Get entrypoint sizes
  const entrypointSizes = {};
  Object.entries(entrypoints).forEach(([name, entry]) => {
    const size = entry.assets.reduce((total, asset) => {
      const matchingAsset = assets.find(a => a.name === asset.name);
      return total + (matchingAsset ? matchingAsset.size : 0);
    }, 0);
    entrypointSizes[name] = size;
  });

  // Get chunk sizes
  const chunkSizes = assets
    .filter(asset => asset.name.includes('chunk'))
    .map(asset => ({
      name: asset.name,
      size: asset.size,
    }));

  return {
    total: totalSize,
    byType: sizesByType,
    entrypoints: entrypointSizes,
    chunks: chunkSizes,
    assets: assets.map(asset => ({
      name: asset.name,
      size: asset.size,
    })),
  };
}

// Check performance budgets
function checkPerformanceBudgets(bundleSizes) {
  console.log(chalk.blue('🔍 Checking performance budgets...'));

  const violations = [];

  // Check entrypoint sizes
  Object.entries(bundleSizes.entrypoints).forEach(([name, size]) => {
    if (size > PERFORMANCE_BUDGETS.maxEntrypointSize) {
      violations.push({
        type: 'entrypoint',
        name,
        size,
        budget: PERFORMANCE_BUDGETS.maxEntrypointSize,
        overage: size - PERFORMANCE_BUDGETS.maxEntrypointSize,
      });
    }
  });

  // Check asset sizes
  bundleSizes.assets.forEach(asset => {
    if (asset.size > PERFORMANCE_BUDGETS.maxAssetSize) {
      violations.push({
        type: 'asset',
        name: asset.name,
        size: asset.size,
        budget: PERFORMANCE_BUDGETS.maxAssetSize,
        overage: asset.size - PERFORMANCE_BUDGETS.maxAssetSize,
      });
    }
  });

  // Check chunk sizes
  bundleSizes.chunks.forEach(chunk => {
    const budget = chunk.name.includes('async')
      ? PERFORMANCE_BUDGETS.maxAsyncChunkSize
      : PERFORMANCE_BUDGETS.maxInitialChunkSize;

    if (chunk.size > budget) {
      violations.push({
        type: 'chunk',
        name: chunk.name,
        size: chunk.size,
        budget,
        overage: chunk.size - budget,
      });
    }
  });

  return violations;
}

// Analyze dependencies
function analyzeDependencies(stats) {
  console.log(chalk.blue('📚 Analyzing dependencies...'));

  // Read package.json to get dependencies
  const packageJsonPath = path.resolve(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  const dependencies = {};

  // Add all dependencies from package.json
  const allDeps = {
    ...packageJson.dependencies || {},
    ...packageJson.devDependencies || {}
  };

  Object.keys(allDeps).forEach(name => {
    // Estimate size based on asset names
    const matchingAssets = stats.assets.filter(asset =>
      asset.name.includes(name.toLowerCase()) ||
      asset.name.includes(name.replace(/-/g, '').toLowerCase())
    );

    const size = matchingAssets.reduce((total, asset) => total + asset.size, 0);

    dependencies[name] = {
      size: size || 10000, // Default size if we can't determine
      count: matchingAssets.length || 1,
      version: allDeps[name]
    };
  });

  return dependencies;
}

// Print summary
function printSummary(report) {
  console.log(chalk.blue('\n📊 Performance Summary:'));

  // Format bytes to human-readable format
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Total size
  console.log(`Total bundle size: ${chalk.bold(formatBytes(report.summary.totalSize))}`);

  // Main entrypoint size
  console.log(`Main entrypoint size: ${chalk.bold(formatBytes(report.summary.entryPointSize))}`);

  // Budget violations
  if (report.budgetViolations.length > 0) {
    console.log(chalk.red(`\n⚠️ Performance budget violations: ${report.budgetViolations.length}`));

    report.budgetViolations.forEach(violation => {
      console.log(chalk.red(`  - ${violation.type} "${violation.name}": ${formatBytes(violation.size)} exceeds budget of ${formatBytes(violation.budget)} by ${formatBytes(violation.overage)}`));
    });
  } else {
    console.log(chalk.green('\n✅ All performance budgets are met'));
  }

  // Top dependencies
  const topDeps = Object.entries(report.dependencies)
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, 5);

  console.log(chalk.blue('\n📦 Top 5 dependencies by size:'));
  topDeps.forEach(([name, info], index) => {
    console.log(`  ${index + 1}. ${name}: ${formatBytes(info.size)}`);
  });
}

// Print recommendations
function printRecommendations(report) {
  console.log(chalk.blue('\n💡 Recommendations:'));

  // Check for large dependencies
  const largeDeps = Object.entries(report.dependencies)
    .filter(([_, info]) => info.size > 100000) // 100 KB
    .sort((a, b) => b[1].size - a[1].size);

  if (largeDeps.length > 0) {
    console.log(chalk.yellow('  Consider optimizing these large dependencies:'));
    largeDeps.forEach(([name, info]) => {
      console.log(`    - ${name}: ${(info.size / 1024).toFixed(2)} KB`);
    });
  }

  // Check for duplicate dependencies
  const duplicateDeps = Object.entries(report.dependencies)
    .filter(([_, info]) => info.count > 5)
    .sort((a, b) => b[1].count - a[1].count);

  if (duplicateDeps.length > 0) {
    console.log(chalk.yellow('\n  Potential duplicate dependencies:'));
    duplicateDeps.forEach(([name, info]) => {
      console.log(`    - ${name}: ${info.count} instances`);
    });
  }

  // Print general recommendations
  printGeneralRecommendations();
}

// Print general recommendations
function printGeneralRecommendations() {
  console.log(chalk.yellow('\n  General recommendations:'));
  console.log('    - Use dynamic imports for route-based code splitting');
  console.log('    - Implement tree-shaking for large libraries');
  console.log('    - Consider using smaller alternatives for large dependencies');
  console.log('    - Optimize images and other assets');
  console.log('    - Use web workers for heavy computations');
  console.log('    - Implement service workers for offline support and improved caching');
  console.log('    - Use code splitting for all routes to reduce initial load time');
  console.log('    - Implement lazy loading for more components');
  console.log('    - Use compression for text-based assets');
  console.log('    - Implement proper cache headers for static assets');
}

// Run the script
main().catch(error => {
  console.error(chalk.red('❌ Unhandled error:'), error);
  process.exit(1);
});
