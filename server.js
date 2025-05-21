// Simple Express server to serve static files
const express = require('express');
const path = require('path');
const compression = require('compression');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';
const START_TIME = new Date();

// Enable compression
app.use(compression());

// Health check endpoint
app.get('/health', (req, res) => {
  const uptime = Math.floor((new Date() - START_TIME) / 1000);
  res.json({
    status: 'ok',
    version: process.env.npm_package_version || 'unknown',
    environment: NODE_ENV,
    uptime: `${uptime} seconds`,
    memory: {
      free: os.freemem(),
      total: os.totalmem()
    },
    cpu: os.cpus().length
  });
});

// API version endpoint
app.get('/api/version', (req, res) => {
  res.json({
    version: process.env.npm_package_version || 'unknown',
    environment: NODE_ENV,
    buildTime: START_TIME.toISOString()
  });
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// For any other request, send the index.html file
// This is needed for client-side routing to work
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
});
