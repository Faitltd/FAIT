# FAIT Project Cleanup Plan

## 🎯 CLEANUP OBJECTIVES
- Remove 980+ duplicate files with " 2" suffix
- Eliminate redundant project directories (453MB+ savings)
- Clean up build artifacts and temporary files
- Streamline project structure for better maintainability

## 📊 CURRENT STATE ANALYSIS
- **Total Redundant Projects**: 453MB (fait-coop-platform: 185MB, fait-svelte: 233MB, fait-new: 35MB)
- **Duplicate Files**: 980 files with " 2" suffix
- **Empty Directories**: fait-modern, fait-mono
- **Build Artifacts**: build/, dist/, multiple node_modules/

## 🚨 PHASE 1: SAFE IMMEDIATE REMOVALS

### 1.1 Empty/Minimal Directories
```bash
rm -rf fait-modern/
rm -rf fait-mono/
```

### 1.2 Duplicate Files with " 2" Suffix
```bash
# Remove all files with " 2" in the name (backups/duplicates)
find . -name "* 2.*" -type f -delete
find . -name "*2.js" -type f -delete
find . -name "*2.tsx" -type f -delete
find . -name "*2.sql" -type f -delete
```

### 1.3 Build Artifacts & Generated Files
```bash
rm -rf build/
rm -rf dist/
rm -rf .svelte-kit/
rm -f bundle-report.txt
rm -f bundle-size-report.txt
rm -f performance-report.json
rm -f performance-test-report.json
```

### 1.4 Misplaced/Temporary Files
```bash
rm -rf Users/
rm -f "Task Rabbit HTML"
rm -f "Thumbtack homepage"
rm -f terminal
rm -f simple-test.cjs
```

## ⚠️ PHASE 2: PROJECT CONSOLIDATION (Requires Decision)

### 2.1 Redundant Project Directories
**DECISION NEEDED**: Which project is the primary one?

**Options:**
- **Keep**: Current root project (main Svelte app)
- **Remove**: fait-coop-platform/ (185MB - React duplicate)
- **Remove**: fait-svelte/ (233MB - older Svelte version)
- **Remove**: fait-new/ (35MB - minimal Svelte)

### 2.2 Apps Directory Analysis
```
apps/
├── fait-coop/          # Main app?
├── flippercalc/        # Calculator tool
├── handyman-calculator/# Calculator tool
├── home-health-score/  # Health tool
├── offershield/        # Shield tool
└── remodeling-calculator/ # Calculator tool
```

**DECISION NEEDED**: Are these separate microservices or can they be consolidated?

## 🔧 PHASE 3: STRUCTURE OPTIMIZATION

### 3.1 Cypress Test Cleanup
- Remove duplicate test files
- Consolidate test configurations
- Clean up test results and screenshots

### 3.2 Configuration Cleanup
- Remove duplicate config files
- Standardize on single configuration approach
- Update .gitignore to prevent future duplicates

### 3.3 Dependencies Cleanup
- Remove unused node_modules directories
- Consolidate package.json files
- Remove redundant lock files

## 📋 RECOMMENDED EXECUTION ORDER

1. **Backup Current State** (git commit current state)
2. **Execute Phase 1** (safe removals)
3. **Test Application** (ensure nothing breaks)
4. **Decide on Phase 2** (project consolidation)
5. **Execute Phase 2** (with backups)
6. **Execute Phase 3** (optimization)
7. **Update .gitignore** (prevent future issues)

## 💾 ESTIMATED SPACE SAVINGS
- **Phase 1**: ~50MB (build artifacts, duplicates)
- **Phase 2**: ~453MB (redundant projects)
- **Phase 3**: ~20MB (test artifacts, configs)
- **Total**: ~523MB savings

## 🛡️ SAFETY MEASURES
- Create git commit before each phase
- Test application after each major removal
- Keep backups of removed projects (temporarily)
- Document all changes for rollback if needed
