/**
 * Fix Supabase Imports Script - All Files
 * 
 * This script fixes all imports in the codebase.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');

// Find all JavaScript and TypeScript files
const findFiles = (dir) => {
  const results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results.push(...findFiles(filePath));
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      results.push(filePath);
    }
  }
  
  return results;
};

// Check if a file has the bad import
const needsPatching = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  return /import\s+supabase\s+from\s+['"](.+?)utils\/utils\/supabaseClient(Simple)?['"];/.test(content) ||
         /import\s+supabase\s+from\s+['"](.+?)\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/utils\/supabaseClient(Simple)?['"];/.test(content);
};

// Patch a file to fix the import
const patchFile = (filePath) => {
  console.log(`Patching ${path.relative(SRC_DIR, filePath)}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Calculate relative path to utils directory
  const fileDir = path.dirname(filePath);
  const relPath = path.relative(fileDir, path.join(SRC_DIR, 'utils')).replace(/\\/g, '/');
  const relativePath = relPath.endsWith('/') ? relPath : `${relPath}/`;
  const importPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
  
  // Replace bad imports
  content = content.replace(
    /import\s+supabase\s+from\s+['"](.+?)utils\/utils\/supabaseClient(Simple)?['"];/g,
    `import supabase from '${importPath}supabaseClient';`
  );
  
  content = content.replace(
    /import\s+supabase\s+from\s+['"](.+?)\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/utils\/supabaseClient(Simple)?['"];/g,
    `import supabase from '${importPath}supabaseClient';`
  );
  
  // Write the fixed content back to the file
  fs.writeFileSync(filePath, content);
  
  return true;
};

// Main function
const main = () => {
  console.log('Searching for files that need patching...');
  
  const files = findFiles(SRC_DIR);
  const filesToPatch = files.filter(needsPatching);
  
  console.log(`Found ${filesToPatch.length} files that need patching.`);
  
  let patchedCount = 0;
  
  for (const file of filesToPatch) {
    try {
      const patched = patchFile(file);
      if (patched) {
        patchedCount++;
      }
    } catch (error) {
      console.error(`Error patching ${file}:`, error);
    }
  }
  
  console.log(`Patched ${patchedCount} files successfully.`);
};

// Run the script
main();
