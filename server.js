// Simple HTTP server to serve static files
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';
const START_TIME = new Date();

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

// Create the server
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Parse the URL
  const parsedUrl = url.parse(req.url);

  // Handle special case for Home service photos
  if (parsedUrl.pathname.startsWith('/Home%20service%20photos/') ||
      parsedUrl.pathname.startsWith('/Home service photos/')) {
    // Redirect to the correct path in the images/home-services directory
    const filename = path.basename(decodeURIComponent(parsedUrl.pathname));
    const newPath = path.join(__dirname, 'dist', 'images', 'home-services', filename);

    fs.readFile(newPath, (err, data) => {
      if (err) {
        console.error(`Error loading image: ${newPath}`, err);
        res.writeHead(404);
        res.end('Image not found');
        return;
      }

      // Get the file extension
      const ext = path.parse(newPath).ext;

      // Set the content type
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'image/jpeg' });

      // Send the file data
      res.end(data);
    });
    return;
  }

  // Extract the path from the URL
  let pathname = path.join(__dirname, 'dist', parsedUrl.pathname);

  // Special case for health check
  if (parsedUrl.pathname === '/health') {
    const uptime = Math.floor((new Date() - START_TIME) / 1000);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      version: process.env.npm_package_version || 'unknown',
      environment: NODE_ENV,
      uptime: `${uptime} seconds`
    }));
    return;
  }

  // Special case for API version
  if (parsedUrl.pathname === '/api/version') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      version: process.env.npm_package_version || 'unknown',
      environment: NODE_ENV,
      buildTime: START_TIME.toISOString()
    }));
    return;
  }

  // Check if the file exists
  fs.stat(pathname, (err, stats) => {
    if (err) {
      // If the file doesn't exist, serve index.html for client-side routing
      pathname = path.join(__dirname, 'dist', 'index.html');
      fs.readFile(pathname, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading index.html');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
      return;
    }

    // If it's a directory, serve index.html
    if (stats.isDirectory()) {
      pathname = path.join(pathname, 'index.html');
    }

    // Read the file
    fs.readFile(pathname, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end(`Error loading ${pathname}`);
        return;
      }

      // Get the file extension
      const ext = path.parse(pathname).ext;

      // Set the content type
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });

      // Send the file data
      res.end(data);
    });
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
});
