// Custom middleware for Vite to handle all routes
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
