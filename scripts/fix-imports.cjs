/**
 * Fix Supabase Imports Script
 * 
 * This script finds all files with incorrect imports and fixes them.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const UTILS_DIR = path.resolve(SRC_DIR, 'utils');

// Create the utils directory if it doesn't exist
if (!fs.existsSync(UTILS_DIR)) {
  fs.mkdirSync(UTILS_DIR, { recursive: true });
}

// Find files with bad imports
console.log('Finding files with bad imports...');
const grepCommand = `grep -r "import supabase from .*utils/utils/supabase" ${SRC_DIR} --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx"`;

try {
  const grepOutput = execSync(grepCommand, { encoding: 'utf8' });
  const filesToFix = new Set();
  
  grepOutput.split('\n').forEach(line => {
    if (line.trim() === '') return;
    
    const filePath = line.split(':')[0];
    if (filePath) {
      filesToFix.add(filePath);
    }
  });
  
  console.log(`Found ${filesToFix.size} files to fix.`);
  
  // Fix each file
  filesToFix.forEach(filePath => {
    console.log(`Fixing ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Calculate relative path to utils directory
    const fileDir = path.dirname(filePath);
    const relPath = path.relative(fileDir, UTILS_DIR).replace(/\\/g, '/');
    const relativePath = relPath.endsWith('/') ? relPath : `${relPath}/`;
    const importPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
    
    // Replace bad imports
    content = content.replace(
      /import\s+supabase\s+from\s+['"](.+?)utils\/utils\/supabaseClient(Simple)?['"];/g,
      `import supabase from '${importPath}supabaseClient';`
    );
    
    // Write the fixed content back to the file
    fs.writeFileSync(filePath, content);
  });
  
  console.log('All imports fixed successfully!');
} catch (error) {
  console.error('Error finding or fixing imports:', error.message);
}
