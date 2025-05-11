const express = require('express');
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validation');
const { requireAdmin, requireServiceAgent } = require('../middleware/auth');
const verificationController = require('../controllers/verificationController');

const router = express.Router();

/**
 * @route GET /api/verifications
 * @desc Get all verifications (admin only)
 * @access Private/Admin
 */
router.get(
  '/',
  requireAdmin,
  [
    query('status').optional(),
    query('level').optional(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
  ],
  verificationController.getAllVerifications
);

/**
 * @route GET /api/verifications/:id
 * @desc Get verification by ID
 * @access Private (admin or service agent who owns the verification)
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid verification ID'),
    validate
  ],
  verificationController.getVerificationById
);

/**
 * @route POST /api/verifications
 * @desc Create a new verification request
 * @access Private (service agents only)
 */
router.post(
  '/',
  requireServiceAgent,
  [
    body('verification_level').isIn(['basic', 'standard', 'premium']).withMessage('Valid verification level is required'),
    validate
  ],
  verificationController.createVerification
);

/**
 * @route PUT /api/verifications/:id
 * @desc Update verification status (admin only)
 * @access Private/Admin
 */
router.put(
  '/:id',
  requireAdmin,
  [
    param('id').isUUID().withMessage('Invalid verification ID'),
    body('verification_status').isIn(['pending', 'in_review', 'approved', 'rejected', 'expired']).withMessage('Valid verification status is required'),
    body('is_verified').optional().isBoolean(),
    body('rejection_reason').optional(),
    validate
  ],
  verificationController.updateVerification
);

/**
 * @route POST /api/verifications/:id/documents
 * @desc Upload verification documents
 * @access Private (service agent who owns the verification)
 */
router.post(
  '/:id/documents',
  [
    param('id').isUUID().withMessage('Invalid verification ID'),
    body('document_type').isIn([
      'identity',
      'business_license',
      'insurance',
      'certification',
      'tax_document',
      'reference',
      'portfolio',
      'background_check'
    ]).withMessage('Valid document type is required'),
    body('document_url').notEmpty().withMessage('Document URL is required'),
    body('document_name').notEmpty().withMessage('Document name is required'),
    body('document_number').optional(),
    body('issuing_authority').optional(),
    body('expiration_date').optional().isDate(),
    validate
  ],
  verificationController.uploadDocument
);

/**
 * @route PUT /api/verifications/:id/documents/:documentId
 * @desc Update document status (admin only)
 * @access Private/Admin
 */
router.put(
  '/:id/documents/:documentId',
  requireAdmin,
  [
    param('id').isUUID().withMessage('Invalid verification ID'),
    param('documentId').isUUID().withMessage('Invalid document ID'),
    body('document_status').isIn(['pending', 'approved', 'rejected', 'expired']).withMessage('Valid document status is required'),
    body('rejection_reason').optional(),
    validate
  ],
  verificationController.updateDocumentStatus
);

/**
 * @route GET /api/verifications/agent/:agentId
 * @desc Get verification for a specific service agent
 * @access Private (admin or the service agent)
 */
router.get(
  '/agent/:agentId',
  [
    param('agentId').isUUID().withMessage('Invalid agent ID'),
    validate
  ],
  verificationController.getAgentVerification
);

module.exports = router;
