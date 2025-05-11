/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Check if the error has a status code, otherwise default to 500
  const statusCode = err.statusCode || 500;
  
  // Check if the error has a message, otherwise use a default message
  const message = err.message || 'Internal server error';
  
  // Send the error response
  res.status(statusCode).json({
    error: {
      message,
      status: statusCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    }
  });
};

module.exports = errorHandler;
