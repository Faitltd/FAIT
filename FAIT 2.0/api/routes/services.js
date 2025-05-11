const express = require('express');
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticateToken, requireServiceAgent } = require('../middleware/auth');
const serviceController = require('../controllers/serviceController');

const router = express.Router();

/**
 * @route GET /api/services
 * @desc Get all services with optional filtering
 * @access Public
 */
router.get(
  '/',
  [
    query('category').optional(),
    query('subcategory').optional(),
    query('min_price').optional().isNumeric(),
    query('max_price').optional().isNumeric(),
    query('service_agent_id').optional().isUUID(),
    query('is_featured').optional().isBoolean(),
    query('is_active').optional().isBoolean(),
    query('zip_code').optional(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
  ],
  serviceController.getAllServices
);

/**
 * @route GET /api/services/:id
 * @desc Get service by ID
 * @access Public
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid service ID'),
    validate
  ],
  serviceController.getServiceById
);

/**
 * @route POST /api/services
 * @desc Create a new service
 * @access Private (service agents only)
 */
router.post(
  '/',
  authenticateToken,
  requireServiceAgent,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('duration').optional().isInt({ min: 1 }),
    body('duration_unit').optional(),
    body('category').optional(),
    body('subcategory').optional(),
    body('is_featured').optional().isBoolean(),
    body('is_active').optional().isBoolean(),
    body('image_urls').optional().isArray(),
    validate
  ],
  serviceController.createService
);

/**
 * @route PUT /api/services/:id
 * @desc Update a service
 * @access Private (service agent who owns the service)
 */
router.put(
  '/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid service ID'),
    body('title').optional(),
    body('description').optional(),
    body('price').optional().isNumeric(),
    body('duration').optional().isInt({ min: 1 }),
    body('duration_unit').optional(),
    body('category').optional(),
    body('subcategory').optional(),
    body('is_featured').optional().isBoolean(),
    body('is_active').optional().isBoolean(),
    body('image_urls').optional().isArray(),
    validate
  ],
  serviceController.updateService
);

/**
 * @route DELETE /api/services/:id
 * @desc Delete a service
 * @access Private (service agent who owns the service)
 */
router.delete(
  '/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Invalid service ID'),
    validate
  ],
  serviceController.deleteService
);

/**
 * @route GET /api/services/agent/:agentId
 * @desc Get all services by a specific service agent
 * @access Public
 */
router.get(
  '/agent/:agentId',
  [
    param('agentId').isUUID().withMessage('Invalid agent ID'),
    query('is_active').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
  ],
  serviceController.getServicesByAgent
);

/**
 * @route GET /api/services/search
 * @desc Search services by keyword
 * @access Public
 */
router.get(
  '/search',
  [
    query('q').notEmpty().withMessage('Search query is required'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
  ],
  serviceController.searchServices
);

module.exports = router;
