const { validationResult } = require('express-validator');

/**
 * Middleware to validate request data
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        message: 'Validation error',
        details: errors.array()
      }
    });
  }
  
  next();
};

module.exports = {
  validate
};
