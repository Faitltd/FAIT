#!/bin/bash

# Script to perform a simple bundle size analysis without requiring source maps

# Build the project
echo "Building project..."
npm run build -- --mode production

# Check if the build was successful
if [ $? -ne 0 ]; then
  echo "Build failed. Aborting analysis."
  exit 1
fi

echo "Bundle Size Analysis"
echo "===================="
echo ""

# Create a report file
REPORT_FILE="bundle-size-report.txt"
echo "Bundle Size Report" > $REPORT_FILE
echo "==================" >> $REPORT_FILE
echo "Generated on $(date)" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Function to convert bytes to human-readable format
function human_readable_size() {
  local bytes=$1
  if [ $bytes -lt 1024 ]; then
    echo "${bytes}B"
  elif [ $bytes -lt 1048576 ]; then
    echo "$(echo "scale=2; $bytes/1024" | bc)KB"
  else
    echo "$(echo "scale=2; $bytes/1048576" | bc)MB"
  fi
}

# Analyze main chunks
echo "Main chunks:" | tee -a $REPORT_FILE
find dist/assets -name "index-*.js" -type f | while read file; do
  size=$(stat -f%z "$file")
  human_size=$(human_readable_size $size)
  echo "  $(basename $file): $human_size" | tee -a $REPORT_FILE
done
echo "" | tee -a $REPORT_FILE

# Analyze vendor chunks
echo "Vendor chunks:" | tee -a $REPORT_FILE
find dist/assets -name "*-vendor-*.js" -type f | while read file; do
  size=$(stat -f%z "$file")
  human_size=$(human_readable_size $size)
  echo "  $(basename $file): $human_size" | tee -a $REPORT_FILE
done
echo "" | tee -a $REPORT_FILE

# Analyze other chunks
echo "Other chunks:" | tee -a $REPORT_FILE
find dist/assets -name "*.js" -type f | grep -v "index-" | grep -v "-vendor-" | while read file; do
  size=$(stat -f%z "$file")
  human_size=$(human_readable_size $size)
  echo "  $(basename $file): $human_size" | tee -a $REPORT_FILE
done
echo "" | tee -a $REPORT_FILE

# Calculate total size
total_size=0
find dist/assets -name "*.js" -type f | while read file; do
  size=$(stat -f%z "$file")
  total_size=$((total_size + size))
done

# Print total size
human_total=$(human_readable_size $total_size)
echo "Total JavaScript bundle size: $human_total" | tee -a $REPORT_FILE

echo ""
echo "Report saved to $REPORT_FILE"
