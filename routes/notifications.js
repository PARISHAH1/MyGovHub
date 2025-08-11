const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteNotification
} = require('../controllers/notificationController');

// Get user notifications
router.get('/', auth, getUserNotifications);

// Get unread notification count
router.get('/unread-count', auth, getUnreadCount);

// Mark notification as read
router.put('/:notificationId/read', auth, markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', auth, markAllAsRead);

// Delete notification
router.delete('/:notificationId', auth, deleteNotification);

module.exports = router; 