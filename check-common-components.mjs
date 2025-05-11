import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to read a file
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Check if the common components are being exported correctly
const commonIndexPath = path.join(__dirname, 'src', 'components', 'common', 'index.ts');
const commonIndex = readFile(commonIndexPath);

if (commonIndex) {
  console.log('Common components index file:');
  console.log(commonIndex);
} else {
  console.log('Common components index file not found');
}

// Check individual component files
const componentFiles = ['Button.tsx', 'Card.tsx', 'Badge.tsx'];
for (const file of componentFiles) {
  const filePath = path.join(__dirname, 'src', 'components', 'common', file);
  const content = readFile(filePath);
  
  if (content) {
    console.log(`\n${file} exports:`);
    const exportMatches = content.match(/export\s+(?:const|class|interface|type|function|default)\s+(\w+)/g);
    if (exportMatches) {
      console.log(exportMatches.join('\n'));
    } else {
      console.log('No exports found');
    }
  } else {
    console.log(`\n${file} not found`);
  }
}
