// Simple static server for FAIT 2.0 that handles all routes
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the src directory
app.use('/src', express.static(path.join(__dirname, 'src')));

// Serve static files from the dist directory if it exists
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all routes by serving the index.html file
app.get('*', (req, res) => {
  // If the request is for a static file, let express handle it
  if (req.url.includes('.')) {
    return res.status(404).send('Not found');
  }

  // Try to serve from dist first (production build)
  const distIndexPath = path.join(__dirname, 'dist', 'index.html');
  const publicIndexPath = path.join(__dirname, 'public', 'index.html');
  const indexPath = path.join(__dirname, 'index.html');

  // Check if dist/index.html exists
  try {
    if (require('fs').existsSync(distIndexPath)) {
      return res.sendFile(distIndexPath);
    }

    // Check if public/index.html exists
    if (require('fs').existsSync(publicIndexPath)) {
      return res.sendFile(publicIndexPath);
    }

    // Fall back to index.html in the root directory
    return res.sendFile(indexPath);
  } catch (error) {
    console.error('Error serving index.html:', error);
    return res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Static server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
