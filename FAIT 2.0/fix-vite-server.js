// Script to modify the Vite development server to handle all routes correctly
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the Vite configuration file
const viteConfigPath = path.join(__dirname, 'vite.config.js');

// Read the Vite configuration file
let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');

// Check if the configuration already includes historyApiFallback
if (!viteConfig.includes('historyApiFallback')) {
  // Add historyApiFallback to the server configuration
  viteConfig = viteConfig.replace(
    /server:\s*{([^}]*)}/,
    'server: {$1  historyApiFallback: true,\n  }'
  );

  // Write the modified configuration back to the file
  fs.writeFileSync(viteConfigPath, viteConfig);

  console.log('Vite configuration updated to handle all routes correctly.');
} else {
  console.log('Vite configuration already includes historyApiFallback.');
}

// Create a custom middleware file for Vite
const middlewarePath = path.join(__dirname, 'vite-middleware.js');
const middleware = `// Custom middleware for Vite to handle all routes
export default function historyApiFallbackMiddleware() {
  return (req, res, next) => {
    // If the request is for a static file, let Vite handle it
    if (req.url.includes('.')) {
      next();
      return;
    }
    
    // For all other requests, serve the index.html file
    req.url = '/';
    next();
  };
}
`;

// Write the middleware file
fs.writeFileSync(middlewarePath, middleware);
console.log('Vite middleware file created.');

// Create a script to run the Vite development server with the custom middleware
const runDevPath = path.join(__dirname, 'run-vite-dev.js');
const runDev = `// Script to run the Vite development server with custom middleware
import { createServer } from 'vite';
import historyApiFallbackMiddleware from './vite-middleware.js';

async function startServer() {
  const server = await createServer({
    // The Vite config options
    configFile: './vite.config.js',
    server: {
      port: 3000,
      middlewareMode: false,
    },
  });

  // Add the custom middleware
  server.middlewares.use(historyApiFallbackMiddleware());

  await server.listen();
  
  console.log('Vite development server running with custom middleware');
  console.log(\`Open http://localhost:\${server.config.server.port} in your browser\`);
}

startServer();
`;

// Write the run-dev script
fs.writeFileSync(runDevPath, runDev);
console.log('Vite development server script created.');

// Create a shell script to run the Vite development server
const runDevShPath = path.join(__dirname, 'run-vite-dev.sh');
const runDevSh = `#!/bin/bash

# Run the Vite development server with custom middleware
node run-vite-dev.js
`;

// Write the shell script
fs.writeFileSync(runDevShPath, runDevSh);
fs.chmodSync(runDevShPath, '755'); // Make the script executable
console.log('Vite development server shell script created and made executable.');

console.log('\nTo run the Vite development server with custom middleware, run:');
console.log('./run-vite-dev.sh');
