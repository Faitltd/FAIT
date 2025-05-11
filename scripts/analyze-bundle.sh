#!/bin/bash

# Script to analyze bundle size

# Build the project with source maps and stats
echo "Building project with source maps and stats..."
npm run build -- --mode production --sourcemap

# Install source-map-explorer if not already installed
if ! command -v source-map-explorer &> /dev/null; then
  echo "Installing source-map-explorer..."
  npm install -g source-map-explorer
fi

# Analyze the main bundle
echo "Analyzing main bundle..."
source-map-explorer dist/assets/index-*.js

# Analyze all chunks
echo "Analyzing all chunks..."
for file in dist/assets/*.js; do
  echo "Analyzing $file..."
  source-map-explorer "$file"
done

# Generate a report
echo "Generating bundle size report..."
echo "Bundle Size Report" > bundle-report.txt
echo "================" >> bundle-report.txt
echo "" >> bundle-report.txt
echo "Generated on $(date)" >> bundle-report.txt
echo "" >> bundle-report.txt

echo "Main chunks:" >> bundle-report.txt
ls -lh dist/assets/index-*.js | awk '{print $5, $9}' >> bundle-report.txt
echo "" >> bundle-report.txt

echo "Vendor chunks:" >> bundle-report.txt
ls -lh dist/assets/vendor-*.js | awk '{print $5, $9}' >> bundle-report.txt
echo "" >> bundle-report.txt

echo "Other chunks:" >> bundle-report.txt
ls -lh dist/assets/*.js | grep -v "index-" | grep -v "vendor-" | awk '{print $5, $9}' >> bundle-report.txt

echo "Report generated at bundle-report.txt"
