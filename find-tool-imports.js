const fs = require('fs');
const path = require('path');

function findInFiles(dir, searchString) {
  const results = [];

  function searchInDirectory(directory) {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        searchInDirectory(filePath);
      } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx'))) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes(searchString)) {
            results.push({ file: filePath, content });
          }
        } catch (err) {
          console.error(`Error reading file ${filePath}:`, err);
        }
      }
    }
  }

  searchInDirectory(dir);
  return results;
}

const sourceDir = './src'; // Adjust this to your project's source directory
const searchString = "import { Tool } from 'lucide-react'";
const results = findInFiles(sourceDir, searchString);

console.log(`Found ${results.length} files with the search string:`);
results.forEach(result => {
  console.log(`- ${result.file}`);
});

import { Tools } from 'lucide-react';
<Tools className="icon" />