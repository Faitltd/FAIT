// A very basic HTTP server that doesn't use any module system
// This should work regardless of the project's module configuration

// Create a simple HTTP server
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 3001;
const ROOT_DIR = __dirname + '/..';

// Basic MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
};

// Create the server
const server = http.createServer(function(req, res) {
  console.log('Request:', req.method, req.url);
  
  // Handle the root path
  let filePath = ROOT_DIR;
  if (req.url === '/') {
    filePath += '/index.html';
  } else {
    filePath += req.url;
  }
  
  // Get the file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
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
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Start the server
server.listen(PORT, function() {
  console.log('Server running at http://localhost:' + PORT + '/');
  console.log('Serving files from:', ROOT_DIR);
  console.log('Press Ctrl+C to stop the server');
});
