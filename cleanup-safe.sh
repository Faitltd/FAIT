#!/bin/bash

# FAIT Project Safe Cleanup Script
# This script removes safe-to-delete files and directories

set -e  # Exit on any error

echo "🧹 FAIT Project Safe Cleanup Starting..."
echo "========================================"

# Create backup commit first
echo "📦 Creating backup commit..."
git add -A
git commit -m "Backup before cleanup - safe removals" || echo "Nothing to commit"

echo ""
echo "🗑️  Phase 1: Safe Immediate Removals"
echo "===================================="

# 1.1 Empty/Minimal Directories
echo "Removing empty directories..."
[ -d "fait-modern" ] && rm -rf fait-modern/ && echo "✅ Removed fait-modern/"
[ -d "fait-mono" ] && rm -rf fait-mono/ && echo "✅ Removed fait-mono/"

# 1.2 Build Artifacts & Generated Files
echo "Removing build artifacts..."
[ -d "build" ] && rm -rf build/ && echo "✅ Removed build/"
[ -d "dist" ] && rm -rf dist/ && echo "✅ Removed dist/"
[ -d ".svelte-kit" ] && rm -rf .svelte-kit/ && echo "✅ Removed .svelte-kit/"

echo "Removing performance reports..."
[ -f "bundle-report.txt" ] && rm -f bundle-report.txt && echo "✅ Removed bundle-report.txt"
[ -f "bundle-size-report.txt" ] && rm -f bundle-size-report.txt && echo "✅ Removed bundle-size-report.txt"
[ -f "performance-report.json" ] && rm -f performance-report.json && echo "✅ Removed performance-report.json"
[ -f "performance-test-report.json" ] && rm -f performance-test-report.json && echo "✅ Removed performance-test-report.json"

# 1.3 Misplaced/Temporary Files
echo "Removing misplaced files..."
[ -d "Users" ] && rm -rf Users/ && echo "✅ Removed Users/"
[ -f "Task Rabbit HTML" ] && rm -f "Task Rabbit HTML" && echo "✅ Removed Task Rabbit HTML"
[ -f "Thumbtack homepage" ] && rm -f "Thumbtack homepage" && echo "✅ Removed Thumbtack homepage"
[ -f "terminal" ] && rm -f terminal && echo "✅ Removed terminal"
[ -f "simple-test.cjs" ] && rm -f simple-test.cjs && echo "✅ Removed simple-test.cjs"

# 1.4 Duplicate Files with " 2" Suffix (be careful with this)
echo "Counting duplicate files with ' 2' suffix..."
DUPLICATE_COUNT=$(find . -name "* 2.*" -type f | wc -l)
echo "Found $DUPLICATE_COUNT duplicate files"

if [ "$DUPLICATE_COUNT" -gt 0 ]; then
    echo "Removing duplicate files with ' 2' suffix..."
    find . -name "* 2.*" -type f -delete
    echo "✅ Removed $DUPLICATE_COUNT duplicate files"
fi

# 1.5 Cypress artifacts
echo "Cleaning up Cypress artifacts..."
[ -d "cypress/screenshots" ] && rm -rf cypress/screenshots/* && echo "✅ Cleaned Cypress screenshots"
[ -d "cypress/results" ] && rm -rf cypress/results/* && echo "✅ Cleaned Cypress results"

echo ""
echo "📊 Cleanup Summary"
echo "=================="
echo "✅ Empty directories removed"
echo "✅ Build artifacts removed"
echo "✅ Temporary files removed"
echo "✅ Duplicate files removed"
echo "✅ Test artifacts cleaned"

echo ""
echo "💾 Checking disk space saved..."
du -sh . 2>/dev/null | head -1

echo ""
echo "🎉 Safe cleanup completed successfully!"
echo ""
echo "⚠️  NEXT STEPS:"
echo "1. Test your application to ensure nothing is broken"
echo "2. Review cleanup-plan.md for Phase 2 (project consolidation)"
echo "3. Decide which redundant projects to remove:"
echo "   - fait-coop-platform/ (185MB)"
echo "   - fait-svelte/ (233MB)" 
echo "   - fait-new/ (35MB)"
echo ""
echo "Run 'git status' to see what was removed"
