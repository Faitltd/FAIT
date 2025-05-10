// A very basic HTTP server that uses CommonJS syntax
// This should work regardless of the project's module configuration

// Create a simple HTTP server
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 3001;
const ROOT_DIR = __dirname;

// Basic MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.jsx': 'text/javascript',
  '.ts': 'text/javascript',
  '.tsx': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
};

// Create the server
const server = http.createServer(function(req, res) {
  console.log('Request:', req.method, req.url);

  // Handle the root path
  let filePath = ROOT_DIR;
  if (req.url === '/') {
    filePath = path.join(filePath, 'index.html');
  } else {
    filePath = path.join(filePath, req.url);
  }

  // Special case for /public/ URLs
  if (req.url.startsWith('/public/')) {
    filePath = path.join(ROOT_DIR, req.url);
  }

  // Special case for /src/ URLs
  if (req.url.startsWith('/src/')) {
    filePath = path.join(ROOT_DIR, req.url);
  }

  // Handle module scripts
  if (req.url.endsWith('.tsx') || req.url.endsWith('.jsx') || req.url.endsWith('.ts')) {
    res.setHeader('Content-Type', 'text/javascript');
  }

  // Get the file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';

  // Force HTML content type for HTML files
  if (extname === '.html') {
    contentType = 'text/html';
  }

  // Read the file
  fs.readFile(filePath, function(error, content) {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found
        console.error('File not found:', filePath);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        // Server error
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
    } else {
      // Success
      console.log('Serving:', filePath, 'with content type:', contentType);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Start the server
server.listen(PORT, function() {
  console.log('Server running at http://localhost:' + PORT + '/');
  console.log('Serving files from:', ROOT_DIR);
  console.log('Static test page available at: http://localhost:' + PORT + '/test.html');
  console.log('Simple test page available at: http://localhost:' + PORT + '/simple-test.html');
  console.log('CSS diagnostic tool available at: http://localhost:' + PORT + '/public/css-diagnostic.html');
  console.log('Press Ctrl+C to stop the server');
});
