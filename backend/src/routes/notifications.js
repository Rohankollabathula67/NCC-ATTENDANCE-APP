import express from 'express';
import Notification from '../models/Notification.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get notifications for current user
// @access  Protected
router.get('/', protect, async (req, res, next) => {
    try {
        const recipientId = req.user.role === 'admin' ? 'all' : req.user._id.toString();

        const notifications = await Notification.find({
            $or: [
                { recipientId: recipientId },
                { recipientId: 'all' }
            ]
        }).sort({ timestamp: -1 }).limit(50);

        res.json(notifications);
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/notifications/unread
// @desc    Get unread notifications
// @access  Protected
router.get('/unread', protect, async (req, res, next) => {
    try {
        const recipientId = req.user.role === 'admin' ? 'all' : req.user._id.toString();
        const notifications = await Notification.getUnread(recipientId);
        res.json(notifications);
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/notifications
// @desc    Create notification
// @access  Admin only
router.post('/', protect, adminOnly, async (req, res, next) => {
    try {
        const { title, message, type, recipientId } = req.body;

        const notification = await Notification.create({
            title,
            message,
            type: type || 'info',
            recipientId: recipientId || 'all'
        });

        res.status(201).json(notification);
    } catch (error) {
        next(error);
    }
});

// @route   PATCH /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Protected
router.patch('/:id/read', protect, async (req, res, next) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/notifications
// @desc    Clear all notifications
// @access  Admin only
router.delete('/', protect, adminOnly, async (req, res, next) => {
    try {
        await Notification.deleteMany({});
        res.json({ message: 'All notifications cleared' });
    } catch (error) {
        next(error);
    }
});

export default router;
