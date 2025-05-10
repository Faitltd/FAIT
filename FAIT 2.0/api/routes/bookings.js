const express = require('express');
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validation');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

/**
 * @route GET /api/bookings
 * @desc Get all bookings for the authenticated user
 * @access Private
 */
router.get(
  '/',
  [
    query('status').optional(),
    query('from_date').optional().isDate(),
    query('to_date').optional().isDate(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
  ],
  bookingController.getUserBookings
);

/**
 * @route GET /api/bookings/:id
 * @desc Get booking by ID
 * @access Private (client, service agent, or admin involved in the booking)
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid booking ID'),
    validate
  ],
  bookingController.getBookingById
);

/**
 * @route POST /api/bookings
 * @desc Create a new booking
 * @access Private
 */
router.post(
  '/',
  [
    body('service_agent_id').isUUID().withMessage('Valid service agent ID is required'),
    body('service_package_id').isUUID().withMessage('Valid service package ID is required'),
    body('booking_date').isDate().withMessage('Valid booking date is required'),
    body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required (HH:MM)'),
    body('notes').optional(),
    validate
  ],
  bookingController.createBooking
);

/**
 * @route PUT /api/bookings/:id
 * @desc Update a booking
 * @access Private (client, service agent, or admin involved in the booking)
 */
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid booking ID'),
    body('status').optional().isIn(['pending', 'confirmed', 'completed', 'cancelled']),
    body('booking_date').optional().isDate(),
    body('start_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('end_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('notes').optional(),
    validate
  ],
  bookingController.updateBooking
);

/**
 * @route DELETE /api/bookings/:id
 * @desc Cancel a booking
 * @access Private (client, service agent, or admin involved in the booking)
 */
router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid booking ID'),
    body('cancellation_reason').optional(),
    validate
  ],
  bookingController.cancelBooking
);

/**
 * @route POST /api/bookings/:id/complete
 * @desc Mark a booking as completed
 * @access Private (service agent or admin involved in the booking)
 */
router.post(
  '/:id/complete',
  [
    param('id').isUUID().withMessage('Invalid booking ID'),
    validate
  ],
  bookingController.completeBooking
);

/**
 * @route POST /api/bookings/:id/review
 * @desc Add a review for a completed booking
 * @access Private (client involved in the booking)
 */
router.post(
  '/:id/review',
  [
    param('id').isUUID().withMessage('Invalid booking ID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('review_text').optional(),
    body('is_public').optional().isBoolean(),
    validate
  ],
  bookingController.addReview
);

/**
 * @route POST /api/bookings/:id/warranty-claim
 * @desc Create a warranty claim for a booking
 * @access Private (client involved in the booking)
 */
router.post(
  '/:id/warranty-claim',
  [
    param('id').isUUID().withMessage('Invalid booking ID'),
    body('claim_title').notEmpty().withMessage('Claim title is required'),
    body('claim_description').notEmpty().withMessage('Claim description is required'),
    body('photo_urls').optional().isArray(),
    validate
  ],
  bookingController.createWarrantyClaim
);

module.exports = router;
