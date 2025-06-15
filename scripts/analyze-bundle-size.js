#!/usr/bin/env node

/**
 * Bundle size analyzer script
 * 
 * This script analyzes the bundle size of the application and provides
 * recommendations for optimization.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const zlib = require('zlib');

// Configuration
const DIST_DIR = path.join(__dirname, '../dist');
const SIZE_THRESHOLDS = {
  js: {
    warning: 100 * 1024, // 100 KB
    error: 250 * 1024,   // 250 KB
  },
  css: {
    warning: 50 * 1024,  // 50 KB
    error: 100 * 1024,   // 100 KB
  },
  total: {
    warning: 1 * 1024 * 1024,  // 1 MB
    error: 2 * 1024 * 1024,    // 2 MB
  }
};

// Main function
async function analyzeBundleSize() {
  console.log(chalk.blue.bold('📦 Bundle Size Analyzer'));
  console.log(chalk.blue('=============================='));
  
  try {
    // Check if dist directory exists
    if (!fs.existsSync(DIST_DIR)) {
      console.error(chalk.red('❌ Dist directory not found. Run build first.'));
      process.exit(1);
    }
    
    // Get all files in dist directory recursively
    const files = getAllFiles(DIST_DIR);
    
    // Group files by type
    const filesByType = groupFilesByType(files);
    
    // Calculate sizes
    const sizeByType = await calculateSizeByType(filesByType);
    
    // Print summary
    printSummary(sizeByType);
    
    // Check for large files
    checkLargeFiles(files);
    
    // Provide recommendations
    provideRecommendations(sizeByType, files);
    
  } catch (error) {
    console.error(chalk.red(`❌ Error analyzing bundle size: ${error.message}`));
    process.exit(1);
  }
}

// Get all files in directory recursively
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push({
        path: filePath,
        relativePath: path.relative(DIST_DIR, filePath),
        size: fs.statSync(filePath).size,
        extension: path.extname(file).toLowerCase().substring(1)
      });
    }
  });
  
  return fileList;
}

// Group files by type
function groupFilesByType(files) {
  const filesByType = {
    js: [],
    css: [],
    html: [],
    images: [],
    fonts: [],
    other: []
  };
  
  files.forEach(file => {
    switch (file.extension) {
      case 'js':
      case 'mjs':
        filesByType.js.push(file);
        break;
      case 'css':
        filesByType.css.push(file);
        break;
      case 'html':
        filesByType.html.push(file);
        break;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp':
        filesByType.images.push(file);
        break;
      case 'woff':
      case 'woff2':
      case 'ttf':
      case 'eot':
      case 'otf':
        filesByType.fonts.push(file);
        break;
      default:
        filesByType.other.push(file);
    }
  });
  
  return filesByType;
}

// Calculate size by type
async function calculateSizeByType(filesByType) {
  const sizeByType = {};
  let totalSize = 0;
  let totalGzipSize = 0;
  
  for (const [type, files] of Object.entries(filesByType)) {
    let typeSize = 0;
    let typeGzipSize = 0;
    
    for (const file of files) {
      typeSize += file.size;
      
      // Calculate gzip size
      const content = fs.readFileSync(file.path);
      const gzipSize = zlib.gzipSync(content).length;
      file.gzipSize = gzipSize;
      
      typeGzipSize += gzipSize;
    }
    
    sizeByType[type] = {
      size: typeSize,
      gzipSize: typeGzipSize,
      files: files.length
    };
    
    totalSize += typeSize;
    totalGzipSize += typeGzipSize;
  }
  
  sizeByType.total = {
    size: totalSize,
    gzipSize: totalGzipSize
  };
  
  return sizeByType;
}

// Print summary
function printSummary(sizeByType) {
  console.log(chalk.blue.bold('\n📊 Bundle Size Summary'));
  console.log(chalk.blue('=============================='));
  
  console.log(chalk.bold('\nFile Type\t\tFiles\tSize\t\tGzip Size'));
  console.log(chalk.gray('--------------------------------------------------------'));
  
  for (const [type, data] of Object.entries(sizeByType)) {
    if (type === 'total') continue;
    
    const size = formatSize(data.size);
    const gzipSize = formatSize(data.gzipSize);
    const files = data.files;
    
    // Determine color based on size
    let sizeColor = chalk.green;
    if (type === 'js' && data.size > SIZE_THRESHOLDS.js.warning) {
      sizeColor = data.size > SIZE_THRESHOLDS.js.error ? chalk.red : chalk.yellow;
    } else if (type === 'css' && data.size > SIZE_THRESHOLDS.css.warning) {
      sizeColor = data.size > SIZE_THRESHOLDS.css.error ? chalk.red : chalk.yellow;
    }
    
    console.log(
      `${chalk.cyan(type.padEnd(12))}\t${files.toString().padEnd(8)}${sizeColor(size.padEnd(16))}${chalk.green(gzipSize)}`
    );
  }
  
  console.log(chalk.gray('--------------------------------------------------------'));
  console.log(
    `${chalk.cyan.bold('Total'.padEnd(12))}\t\t${chalk.bold(formatSize(sizeByType.total.size).padEnd(16))}${chalk.green.bold(formatSize(sizeByType.total.gzipSize))}`
  );
  
  // Add warning if total size is too large
  if (sizeByType.total.size > SIZE_THRESHOLDS.total.warning) {
    const color = sizeByType.total.size > SIZE_THRESHOLDS.total.error ? chalk.red : chalk.yellow;
    console.log(color(`\n⚠️  Total bundle size is ${formatSize(sizeByType.total.size)}, which is above the recommended ${formatSize(SIZE_THRESHOLDS.total.warning)}.`));
  }
}

// Check for large files
function checkLargeFiles(files) {
  console.log(chalk.blue.bold('\n🔍 Large Files'));
  console.log(chalk.blue('=============================='));
  
  // Sort files by size (descending)
  const sortedFiles = [...files].sort((a, b) => b.size - a.size);
  
  // Get top 10 largest files
  const largestFiles = sortedFiles.slice(0, 10);
  
  if (largestFiles.length === 0) {
    console.log(chalk.gray('No files found.'));
    return;
  }
  
  console.log(chalk.bold('\nFile\t\t\t\tSize\t\tGzip Size'));
  console.log(chalk.gray('--------------------------------------------------------'));
  
  largestFiles.forEach(file => {
    const size = formatSize(file.size);
    const gzipSize = formatSize(file.gzipSize);
    
    // Determine color based on size
    let sizeColor = chalk.green;
    if (file.extension === 'js' && file.size > SIZE_THRESHOLDS.js.warning) {
      sizeColor = file.size > SIZE_THRESHOLDS.js.error ? chalk.red : chalk.yellow;
    } else if (file.extension === 'css' && file.size > SIZE_THRESHOLDS.css.warning) {
      sizeColor = file.size > SIZE_THRESHOLDS.css.error ? chalk.red : chalk.yellow;
    }
    
    const fileName = file.relativePath.length > 40 
      ? '...' + file.relativePath.substring(file.relativePath.length - 37) 
      : file.relativePath;
    
    console.log(
      `${chalk.cyan(fileName.padEnd(40))}${sizeColor(size.padEnd(16))}${chalk.green(gzipSize)}`
    );
  });
}

// Provide recommendations
function provideRecommendations(sizeByType, files) {
  console.log(chalk.blue.bold('\n💡 Recommendations'));
  console.log(chalk.blue('=============================='));
  
  const recommendations = [];
  
  // Check JS size
  if (sizeByType.js.size > SIZE_THRESHOLDS.js.warning) {
    recommendations.push(
      'Consider code splitting to reduce JavaScript bundle size.',
      'Use dynamic imports for routes and large components.',
      'Check for unused dependencies that can be removed.'
    );
    
    // Check for large vendor files
    const largeVendorFiles = files.filter(
      file => file.extension === 'js' && 
              file.relativePath.includes('vendor') && 
              file.size > 50 * 1024
    );
    
    if (largeVendorFiles.length > 0) {
      recommendations.push(
        'Large vendor bundles detected. Consider optimizing imports from these libraries:',
        ...largeVendorFiles.map(file => `  - ${path.basename(file.relativePath)} (${formatSize(file.size)})`)
      );
    }
  }
  
  // Check CSS size
  if (sizeByType.css.size > SIZE_THRESHOLDS.css.warning) {
    recommendations.push(
      'Consider optimizing CSS:',
      '  - Remove unused CSS with PurgeCSS',
      '  - Use CSS-in-JS for better tree-shaking',
      '  - Split CSS into critical and non-critical'
    );
  }
  
  // Check image size
  if (sizeByType.images && sizeByType.images.size > 500 * 1024) {
    recommendations.push(
      'Optimize images:',
      '  - Use WebP format for better compression',
      '  - Implement responsive images with srcset',
      '  - Consider lazy loading images',
      '  - Compress large images'
    );
  }
  
  // General recommendations
  recommendations.push(
    'General optimizations:',
    '  - Implement code splitting for routes',
    '  - Use React.lazy and Suspense for component-level code splitting',
    '  - Consider using a CDN for static assets',
    '  - Implement proper caching strategies'
  );
  
  // Print recommendations
  if (recommendations.length > 0) {
    console.log(recommendations.join('\n'));
  } else {
    console.log(chalk.green('✅ Your bundle size looks good! No specific recommendations.'));
  }
}

// Format size in KB or MB
function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

// Run the analysis
analyzeBundleSize();
