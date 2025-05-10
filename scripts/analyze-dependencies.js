#!/usr/bin/env node
/**
 * Dependency Analysis Script
 *
 * This script analyzes the project dependencies and identifies large packages
 * that could benefit from tree shaking or alternative implementations.
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LARGE_DEPENDENCY_THRESHOLD = 100 * 1024; // 100 KB
const MEDIUM_DEPENDENCY_THRESHOLD = 50 * 1024; // 50 KB
const PACKAGE_JSON_PATH = path.resolve(path.dirname(__dirname), 'package.json');
const NODE_MODULES_PATH = path.resolve(path.dirname(__dirname), 'node_modules');

// Check if package.json exists
if (!fs.existsSync(PACKAGE_JSON_PATH)) {
  console.error(chalk.red('Error: package.json not found'));
  process.exit(1);
}

// Check if node_modules exists
if (!fs.existsSync(NODE_MODULES_PATH)) {
  console.error(chalk.red('Error: node_modules not found. Run npm install first.'));
  process.exit(1);
}

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
const dependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies
};

console.log(chalk.blue('📦 Analyzing dependencies...'));

// Get dependency sizes
const dependencySizes = [];

Object.keys(dependencies).forEach(dependency => {
  try {
    const dependencyPath = path.resolve(NODE_MODULES_PATH, dependency);

    if (!fs.existsSync(dependencyPath)) {
      return;
    }

    // Get size using du command
    const output = execSync(`du -sk "${dependencyPath}"`, { encoding: 'utf8' });
    const size = parseInt(output.split('\t')[0]) * 1024; // Convert KB to bytes

    dependencySizes.push({
      name: dependency,
      size,
      sizeFormatted: formatSize(size)
    });
  } catch (error) {
    console.error(chalk.yellow(`Warning: Could not analyze ${dependency}`), error.message);
  }
});

// Sort dependencies by size (largest first)
dependencySizes.sort((a, b) => b.size - a.size);

// Print results
console.log(chalk.green('\n📊 Dependency Analysis Results:'));
console.log(chalk.blue('\nLarge Dependencies (> 100 KB):'));

const largeDependencies = dependencySizes.filter(dep => dep.size > LARGE_DEPENDENCY_THRESHOLD);
if (largeDependencies.length === 0) {
  console.log(chalk.green('  None'));
} else {
  largeDependencies.forEach(dep => {
    console.log(chalk.yellow(`  ${dep.name}: ${dep.sizeFormatted}`));
  });
}

console.log(chalk.blue('\nMedium Dependencies (50-100 KB):'));
const mediumDependencies = dependencySizes.filter(
  dep => dep.size > MEDIUM_DEPENDENCY_THRESHOLD && dep.size <= LARGE_DEPENDENCY_THRESHOLD
);
if (mediumDependencies.length === 0) {
  console.log(chalk.green('  None'));
} else {
  mediumDependencies.forEach(dep => {
    console.log(chalk.yellow(`  ${dep.name}: ${dep.sizeFormatted}`));
  });
}

// Provide recommendations
console.log(chalk.green('\n💡 Recommendations:'));

// FullCalendar recommendations
if (dependencySizes.some(dep => dep.name.includes('@fullcalendar'))) {
  console.log(chalk.blue('\nFullCalendar Optimization:'));
  console.log('  - Import only the specific modules you need from FullCalendar');
  console.log('  - Use dynamic imports to load FullCalendar only when needed');
  console.log('  - Example:');
  console.log('    ```');
  console.log('    // Instead of');
  console.log('    import FullCalendar from "@fullcalendar/react";');
  console.log('    import dayGridPlugin from "@fullcalendar/daygrid";');
  console.log('    import timeGridPlugin from "@fullcalendar/timegrid";');
  console.log('    ');
  console.log('    // Use');
  console.log('    const CalendarComponent = lazy(() => import("./CalendarComponent"));');
  console.log('    ```');
}

// Lodash recommendations
if (dependencySizes.some(dep => dep.name === 'lodash' || dep.name === 'lodash-es')) {
  console.log(chalk.blue('\nLodash Optimization:'));
  console.log('  - Import individual functions from lodash instead of the entire library');
  console.log('  - Example:');
  console.log('    ```');
  console.log('    // Instead of');
  console.log('    import _ from "lodash";');
  console.log('    ');
  console.log('    // Use');
  console.log('    import debounce from "lodash/debounce";');
  console.log('    import throttle from "lodash/throttle";');
  console.log('    ```');
}

// Moment.js recommendations
if (dependencySizes.some(dep => dep.name === 'moment')) {
  console.log(chalk.blue('\nMoment.js Alternatives:'));
  console.log('  - Consider using date-fns or dayjs instead of moment.js');
  console.log('  - date-fns is tree-shakable and more lightweight');
  console.log('  - Example:');
  console.log('    ```');
  console.log('    // Instead of');
  console.log('    import moment from "moment";');
  console.log('    const formattedDate = moment(date).format("YYYY-MM-DD");');
  console.log('    ');
  console.log('    // Use');
  console.log('    import { format } from "date-fns";');
  console.log('    const formattedDate = format(date, "yyyy-MM-dd");');
  console.log('    ```');
}

// General recommendations
console.log(chalk.blue('\nGeneral Recommendations:'));
console.log('  - Use dynamic imports for large components and libraries');
console.log('  - Implement code splitting for routes and large components');
console.log('  - Consider using smaller alternatives for large libraries');
console.log('  - Use tree-shakable libraries whenever possible');
console.log('  - Implement proper lazy loading for components');

// Helper function to format size
function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}
