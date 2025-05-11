// Script to run the Vite development server with custom middleware
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
  console.log(`Open http://localhost:${server.config.server.port} in your browser`);
}

startServer();
