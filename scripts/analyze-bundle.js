/**
 * Bundle Analysis Script
 * 
 * This script analyzes the bundle size and identifies large dependencies.
 * It can be used to find opportunities for optimization.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Performance budget thresholds (in bytes)
const PERFORMANCE_BUDGETS = {
  maxEntrypointSize: 250000, // 250 KB
  maxAssetSize: 250000, // 250 KB
  maxInitialChunkSize: 250000, // 250 KB
  maxAsyncChunkSize: 100000, // 100 KB
};

// Run webpack with analyze flag
console.log(chalk.blue('Running webpack with analyze flag...'));
try {
  execSync('npm run webpack:perf:analyze', { stdio: 'inherit' });
} catch (error) {
  console.error(chalk.red('Error running webpack:perf:analyze:'), error);
  process.exit(1);
}

// Read the bundle analysis report
console.log(chalk.blue('Reading bundle analysis report...'));
const reportPath = path.resolve(__dirname, '../bundle-analysis.html');
if (!fs.existsSync(reportPath)) {
  console.error(chalk.red('Bundle analysis report not found. Make sure webpack:perf:analyze ran successfully.'));
  process.exit(1);
}

// Parse the report to extract bundle size information
console.log(chalk.blue('Parsing bundle size information...'));
const reportContent = fs.readFileSync(reportPath, 'utf8');

// Extract bundle size information using regex
const bundleSizeRegex = /<div class="bundle-size">Total: ([\d.]+) (KB|MB)<\/div>/;
const bundleSizeMatch = reportContent.match(bundleSizeRegex);
if (!bundleSizeMatch) {
  console.error(chalk.red('Could not extract bundle size information from the report.'));
  process.exit(1);
}

const bundleSize = parseFloat(bundleSizeMatch[1]);
const bundleSizeUnit = bundleSizeMatch[2];
const bundleSizeBytes = bundleSizeUnit === 'MB' ? bundleSize * 1024 * 1024 : bundleSize * 1024;

// Extract chunk size information
const chunkSizeRegex = /<div class="chunk-name">(.*?)<\/div>[\s\S]*?<div class="chunk-size">([\d.]+) (KB|MB)<\/div>/g;
const chunks = [];
let match;
while ((match = chunkSizeRegex.exec(reportContent)) !== null) {
  const chunkName = match[1];
  const chunkSize = parseFloat(match[2]);
  const chunkSizeUnit = match[3];
  const chunkSizeBytes = chunkSizeUnit === 'MB' ? chunkSize * 1024 * 1024 : chunkSize * 1024;
  chunks.push({ name: chunkName, size: chunkSizeBytes });
}

// Sort chunks by size (largest first)
chunks.sort((a, b) => b.size - a.size);

// Check for performance budget violations
console.log(chalk.blue('Checking for performance budget violations...'));
const violations = [];

// Check total bundle size
if (bundleSizeBytes > PERFORMANCE_BUDGETS.maxEntrypointSize) {
  violations.push({
    type: 'Total Bundle Size',
    actual: bundleSizeBytes,
    budget: PERFORMANCE_BUDGETS.maxEntrypointSize,
    overage: bundleSizeBytes - PERFORMANCE_BUDGETS.maxEntrypointSize,
  });
}

// Check individual chunk sizes
chunks.forEach(chunk => {
  if (chunk.name.includes('main') && chunk.size > PERFORMANCE_BUDGETS.maxInitialChunkSize) {
    violations.push({
      type: `Initial Chunk (${chunk.name})`,
      actual: chunk.size,
      budget: PERFORMANCE_BUDGETS.maxInitialChunkSize,
      overage: chunk.size - PERFORMANCE_BUDGETS.maxInitialChunkSize,
    });
  } else if (chunk.size > PERFORMANCE_BUDGETS.maxAsyncChunkSize) {
    violations.push({
      type: `Async Chunk (${chunk.name})`,
      actual: chunk.size,
      budget: PERFORMANCE_BUDGETS.maxAsyncChunkSize,
      overage: chunk.size - PERFORMANCE_BUDGETS.maxAsyncChunkSize,
    });
  }
});

// Print bundle size information
console.log(chalk.green('\nBundle Size Information:'));
console.log(chalk.white(`Total Bundle Size: ${formatSize(bundleSizeBytes)}`));
console.log(chalk.white(`Number of Chunks: ${chunks.length}`));

// Print largest chunks
console.log(chalk.green('\nLargest Chunks:'));
chunks.slice(0, 10).forEach(chunk => {
  console.log(chalk.white(`${chunk.name}: ${formatSize(chunk.size)}`));
});

// Print performance budget violations
if (violations.length > 0) {
  console.log(chalk.red('\nPerformance Budget Violations:'));
  violations.forEach(violation => {
    console.log(chalk.red(`${violation.type}:`));
    console.log(chalk.red(`  Actual: ${formatSize(violation.actual)}`));
    console.log(chalk.red(`  Budget: ${formatSize(violation.budget)}`));
    console.log(chalk.red(`  Overage: ${formatSize(violation.overage)}`));
  });
  
  // Suggest optimizations
  console.log(chalk.yellow('\nSuggested Optimizations:'));
  
  // Check for large dependencies
  if (chunks.some(chunk => chunk.name.includes('vendors') && chunk.size > 100000)) {
    console.log(chalk.yellow('- Consider replacing large dependencies with smaller alternatives'));
    console.log(chalk.yellow('- Use tree-shakable versions of libraries where possible'));
    console.log(chalk.yellow('- Remove unused dependencies'));
  }
  
  // Check for large initial chunks
  if (chunks.some(chunk => chunk.name.includes('main') && chunk.size > PERFORMANCE_BUDGETS.maxInitialChunkSize)) {
    console.log(chalk.yellow('- Implement more aggressive code splitting for the main chunk'));
    console.log(chalk.yellow('- Move non-critical code to async chunks'));
    console.log(chalk.yellow('- Use dynamic imports for large components'));
  }
  
  // Check for large async chunks
  if (chunks.some(chunk => !chunk.name.includes('main') && chunk.size > PERFORMANCE_BUDGETS.maxAsyncChunkSize)) {
    console.log(chalk.yellow('- Split large async chunks into smaller chunks'));
    console.log(chalk.yellow('- Implement more granular code splitting'));
  }
} else {
  console.log(chalk.green('\nNo performance budget violations found!'));
}

// Helper function to format size
function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes.toFixed(2)} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}
