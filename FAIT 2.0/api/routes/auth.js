const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @route POST /api/auth/login
 * @desc Login user and get token
 * @access Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  authController.login
);

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('user_type')
      .isIn(['client', 'service_agent'])
      .withMessage('User type must be either client or service_agent'),
    validate
  ],
  authController.register
);

/**
 * @route POST /api/auth/forgot-password
 * @desc Send password reset email
 * @access Public
 */
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    validate
  ],
  authController.forgotPassword
);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    validate
  ],
  authController.resetPassword
);

/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh access token
 * @access Public
 */
router.post(
  '/refresh-token',
  [
    body('refresh_token').notEmpty().withMessage('Refresh token is required'),
    validate
  ],
  authController.refreshToken
);

module.exports = router;
