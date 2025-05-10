const express = require('express');
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validation');
const messageController = require('../controllers/messageController');

const router = express.Router();

/**
 * @route GET /api/messages
 * @desc Get all messages for the authenticated user
 * @access Private
 */
router.get(
  '/',
  [
    query('unread').optional().isBoolean(),
    query('contact_id').optional().isUUID(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
  ],
  messageController.getUserMessages
);

/**
 * @route GET /api/messages/conversations
 * @desc Get all conversations for the authenticated user
 * @access Private
 */
router.get(
  '/conversations',
  messageController.getUserConversations
);

/**
 * @route GET /api/messages/conversation/:userId
 * @desc Get conversation with a specific user
 * @access Private
 */
router.get(
  '/conversation/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
  ],
  messageController.getConversationWithUser
);

/**
 * @route POST /api/messages
 * @desc Send a new message
 * @access Private
 */
router.post(
  '/',
  [
    body('recipient_id').isUUID().withMessage('Valid recipient ID is required'),
    body('message_text').notEmpty().withMessage('Message text is required'),
    body('booking_id').optional().isUUID(),
    validate
  ],
  messageController.sendMessage
);

/**
 * @route PUT /api/messages/:id/read
 * @desc Mark a message as read
 * @access Private (recipient only)
 */
router.put(
  '/:id/read',
  [
    param('id').isUUID().withMessage('Invalid message ID'),
    validate
  ],
  messageController.markMessageAsRead
);

/**
 * @route PUT /api/messages/read-all
 * @desc Mark all messages from a specific sender as read
 * @access Private
 */
router.put(
  '/read-all',
  [
    body('sender_id').isUUID().withMessage('Valid sender ID is required'),
    validate
  ],
  messageController.markAllMessagesAsRead
);

/**
 * @route DELETE /api/messages/:id
 * @desc Delete a message
 * @access Private (sender or recipient)
 */
router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid message ID'),
    validate
  ],
  messageController.deleteMessage
);

module.exports = router;
