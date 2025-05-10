// Enhanced Vite development server with proper middleware for SPA routing
import { createServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// History API fallback middleware
function historyApiFallback() {
  return (req, res, next) => {
    // Skip if the request is for a file with an extension
    if (req.url.includes('.') && !req.url.endsWith('.html')) {
      return next();
    }
    
    // Skip API requests
    if (req.url.startsWith('/api/')) {
      return next();
    }
    
    // Skip Cypress requests
    if (req.url.includes('__cypress')) {
      return next();
    }
    
    // Serve index.html for all other requests
    req.url = '/index.html';
    next();
  };
}

async function startServer() {
  try {
    console.log('Starting Vite development server...');
    
    // Create Vite server
    const server = await createServer({
      // Vite config options
      server: {
        port: 3001,
        strictPort: true,
        hmr: true,
        open: false,
      },
      optimizeDeps: {
        force: true,
      },
      build: {
        sourcemap: true,
      },
      logLevel: 'info',
    });
    
    // Add history API fallback middleware
    server.middlewares.use(historyApiFallback());
    
    // Add middleware to handle module scripts correctly
    server.middlewares.use((req, res, next) => {
      if (req.url.endsWith('.tsx') || req.url.endsWith('.jsx') || req.url.endsWith('.ts')) {
        res.setHeader('Content-Type', 'text/javascript');
      }
      next();
    });
    
    // Start the server
    await server.listen();
    
    console.log(`
    ┌──────────────────────────────────────────────────┐
    │                                                  │
    │   🚀 Vite development server running at:         │
    │   http://localhost:${server.config.server.port}                │
    │                                                  │
    │   Ready for FAIT 2.0 testing!                    │
    │                                                  │
    └──────────────────────────────────────────────────┘
    `);
  } catch (error) {
    console.error('Error starting Vite server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
