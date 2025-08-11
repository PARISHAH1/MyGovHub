const Notification = require('../models/Notification');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

// Create notification when admin updates complaint status
exports.createNotification = async (complaintId, newStatus, adminId) => {
    try {
        const complaint = await Complaint.findById(complaintId).populate('user');
        if (!complaint) {
            throw new Error('Complaint not found');
        }

        let title, message, type;

        switch (newStatus) {
            case 'Resolved':
                title = 'Complaint Resolved';
                message = `Your ${complaint.category} complaint has been resolved successfully.`;
                type = 'resolved';
                break;
            case 'In Progress':
                title = 'Complaint In Progress';
                message = `Your ${complaint.category} complaint is now being worked on.`;
                type = 'in_progress';
                break;
            case 'Pending':
                title = 'Complaint Status Updated';
                message = `Your ${complaint.category} complaint status has been updated to pending.`;
                type = 'pending';
                break;
            default:
                title = 'Complaint Status Update';
                message = `Your ${complaint.category} complaint status has been updated to ${newStatus}.`;
                type = 'status_update';
        }

        const notification = new Notification({
            user: complaint.user._id,
            complaint: complaintId,
            type: type,
            title: title,
            message: message,
            adminAction: true
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Get notifications for a user
exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.userId })
            .populate('complaint', 'category description')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, user: req.user.userId },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Failed to update notification' });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user.userId, read: false },
            { read: true }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Failed to update notifications' });
    }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            user: req.user.userId,
            read: false
        });

        res.json({ count });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ message: 'Failed to get unread count' });
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        
        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            user: req.user.userId
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Failed to delete notification' });
    }
}; 