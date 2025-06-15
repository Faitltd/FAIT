/**
 * Patch Supabase Imports
 *
 * This script finds all files that import Supabase directly and patches them
 * to use the singleton client instead.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const IMPORT_PATTERN = /@supabase\/supabase-js/;
const CREATE_CLIENT_PATTERN = /createClient\(/;
const SINGLETON_IMPORT = "import supabase from '../utils/supabaseClient';";
const SINGLETON_IMPORT_RELATIVE = (relPath) => `import supabase from '${relPath}utils/supabaseClient';`;

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

// Check if a file imports Supabase and creates a client
const needsPatching = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  return IMPORT_PATTERN.test(content) && CREATE_CLIENT_PATTERN.test(content);
};

// Patch a file to use the singleton client
const patchFile = (filePath) => {
  console.log(`Patching ${path.relative(SRC_DIR, filePath)}`);

  let content = fs.readFileSync(filePath, 'utf8');

  // Calculate relative path to utils directory
  const fileDir = path.dirname(filePath);
  const relPath = path.relative(fileDir, path.join(SRC_DIR, 'utils')).replace(/\\/g, '/');
  const relativePath = relPath.endsWith('/') ? relPath : `${relPath}/`;

  // Replace imports
  content = content.replace(
    /import\s+.*\s+from\s+['"]@supabase\/supabase-js['"]/g,
    SINGLETON_IMPORT_RELATIVE(relativePath.startsWith('.') ? relativePath : `./${relativePath}`)
  );

  // Replace createClient calls
  content = content.replace(
    /const\s+\w+\s+=\s+createClient\([^)]+\)/g,
    '// Using singleton Supabase client'
  );

  // Write the patched file
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
