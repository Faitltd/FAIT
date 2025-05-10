const express = require('express');
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validation');
const { requireAdmin } = require('../middleware/auth');
const subscriptionController = require('../controllers/subscriptionController');

const router = express.Router();

/**
 * @route GET /api/subscriptions
 * @desc Get subscription for the authenticated user
 * @access Private
 */
router.get(
  '/',
  subscriptionController.getUserSubscription
);

/**
 * @route GET /api/subscriptions/plans
 * @desc Get all available subscription plans
 * @access Public
 */
router.get(
  '/plans',
  subscriptionController.getSubscriptionPlans
);

/**
 * @route POST /api/subscriptions
 * @desc Create a new subscription
 * @access Private
 */
router.post(
  '/',
  [
    body('plan_id').isUUID().withMessage('Valid plan ID is required'),
    body('payment_method_id').notEmpty().withMessage('Payment method ID is required'),
    validate
  ],
  subscriptionController.createSubscription
);

/**
 * @route PUT /api/subscriptions/:id
 * @desc Update a subscription
 * @access Private (subscription owner)
 */
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid subscription ID'),
    body('cancel_at_period_end').optional().isBoolean(),
    validate
  ],
  subscriptionController.updateSubscription
);

/**
 * @route POST /api/subscriptions/:id/cancel
 * @desc Cancel a subscription
 * @access Private (subscription owner)
 */
router.post(
  '/:id/cancel',
  [
    param('id').isUUID().withMessage('Invalid subscription ID'),
    body('cancel_immediately').optional().isBoolean(),
    validate
  ],
  subscriptionController.cancelSubscription
);

/**
 * @route POST /api/subscriptions/:id/reactivate
 * @desc Reactivate a cancelled subscription
 * @access Private (subscription owner)
 */
router.post(
  '/:id/reactivate',
  [
    param('id').isUUID().withMessage('Invalid subscription ID'),
    validate
  ],
  subscriptionController.reactivateSubscription
);

/**
 * @route POST /api/subscriptions/:id/change-plan
 * @desc Change subscription plan
 * @access Private (subscription owner)
 */
router.post(
  '/:id/change-plan',
  [
    param('id').isUUID().withMessage('Invalid subscription ID'),
    body('new_plan_id').isUUID().withMessage('Valid new plan ID is required'),
    body('prorate').optional().isBoolean(),
    validate
  ],
  subscriptionController.changePlan
);

/**
 * @route GET /api/subscriptions/admin/all
 * @desc Get all subscriptions (admin only)
 * @access Private/Admin
 */
router.get(
  '/admin/all',
  requireAdmin,
  [
    query('status').optional(),
    query('plan_id').optional().isUUID(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
  ],
  subscriptionController.getAllSubscriptions
);

/**
 * @route POST /api/subscriptions/admin/plans
 * @desc Create a new subscription plan (admin only)
 * @access Private/Admin
 */
router.post(
  '/admin/plans',
  requireAdmin,
  [
    body('name').notEmpty().withMessage('Plan name is required'),
    body('description').notEmpty().withMessage('Plan description is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('interval').isIn(['month', 'year']).withMessage('Interval must be month or year'),
    body('features').isArray().withMessage('Features must be an array'),
    body('is_active').optional().isBoolean(),
    validate
  ],
  subscriptionController.createPlan
);

/**
 * @route PUT /api/subscriptions/admin/plans/:id
 * @desc Update a subscription plan (admin only)
 * @access Private/Admin
 */
router.put(
  '/admin/plans/:id',
  requireAdmin,
  [
    param('id').isUUID().withMessage('Invalid plan ID'),
    body('name').optional(),
    body('description').optional(),
    body('price').optional().isNumeric(),
    body('interval').optional().isIn(['month', 'year']),
    body('features').optional().isArray(),
    body('is_active').optional().isBoolean(),
    validate
  ],
  subscriptionController.updatePlan
);

module.exports = router;
