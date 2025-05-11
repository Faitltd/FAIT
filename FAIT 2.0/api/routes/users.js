const express = require('express');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validation');
const { requireAdmin, requireOwnerOrAdmin } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

/**
 * @route GET /api/users
 * @desc Get all users (admin only)
 * @access Private/Admin
 */
router.get('/', requireAdmin, userController.getAllUsers);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private (owner or admin)
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid user ID'),
    validate,
    requireOwnerOrAdmin('id')
  ],
  userController.getUserById
);

/**
 * @route PUT /api/users/:id
 * @desc Update user
 * @access Private (owner or admin)
 */
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid user ID'),
    body('first_name').optional(),
    body('last_name').optional(),
    body('phone').optional(),
    body('business_name').optional(),
    validate,
    requireOwnerOrAdmin('id')
  ],
  userController.updateUser
);

/**
 * @route DELETE /api/users/:id
 * @desc Delete user
 * @access Private (owner or admin)
 */
router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid user ID'),
    validate,
    requireOwnerOrAdmin('id')
  ],
  userController.deleteUser
);

/**
 * @route GET /api/users/:id/profile
 * @desc Get user profile
 * @access Private (owner or admin)
 */
router.get(
  '/:id/profile',
  [
    param('id').isUUID().withMessage('Invalid user ID'),
    validate,
    requireOwnerOrAdmin('id')
  ],
  userController.getUserProfile
);

/**
 * @route PUT /api/users/:id/profile
 * @desc Update user profile
 * @access Private (owner or admin)
 */
router.put(
  '/:id/profile',
  [
    param('id').isUUID().withMessage('Invalid user ID'),
    body('first_name').optional(),
    body('last_name').optional(),
    body('full_name').optional(),
    body('phone').optional(),
    body('business_name').optional(),
    body('verification_badge_visible').optional().isBoolean(),
    validate,
    requireOwnerOrAdmin('id')
  ],
  userController.updateUserProfile
);

module.exports = router;
