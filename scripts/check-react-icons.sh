#!/bin/bash

# Script to check for react-icons imports in the codebase

echo "Checking for react-icons imports..."
echo "=================================="
echo ""

# Find all files with react-icons imports
REACT_ICONS_FILES=$(grep -r --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" "react-icons" src)

if [ -z "$REACT_ICONS_FILES" ]; then
  echo "No react-icons imports found! All good."
  exit 0
fi

echo "Found react-icons imports in the following files:"
echo "$REACT_ICONS_FILES"
echo ""
echo "Consider replacing these imports with individual imports from lucide-react."
echo "Example:"
echo "  Before: import { FaArrowLeft } from 'react-icons/fa';"
echo "  After:  import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';"
echo ""
echo "This will significantly reduce your bundle size."
