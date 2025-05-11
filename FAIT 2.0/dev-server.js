// Custom development server for FAIT 2.0
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  // Use vite's connect instance as middleware
  app.use(vite.middlewares);

  // Serve static files from the public directory
  app.use(express.static(path.join(__dirname, 'public')));

  // Handle all routes by serving the index.html file
  app.get('*', (req, res, next) => {
    // If the request is for a static file, let express handle it
    if (req.url.includes('.')) {
      next();
      return;
    }
    
    // Otherwise, serve the index.html file
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  // Start the server
  app.listen(PORT, () => {
    console.log(`Development server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
  });
}

createServer();
