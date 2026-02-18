import express from 'express';
import DrillSchedule from '../models/DrillSchedule.js';
import Notification from '../models/Notification.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/drills
// @desc    Get all drill schedules
// @access  Protected
router.get('/', protect, async (req, res, next) => {
    try {
        const { upcoming } = req.query;

        let drills;
        if (upcoming === 'true') {
            drills = await DrillSchedule.getUpcoming();
        } else {
            drills = await DrillSchedule.find()
                .sort({ date: -1 })
                .populate('createdBy', 'name');
        }

        res.json(drills);
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/drills
// @desc    Create drill schedule
// @access  Admin only
router.post('/', protect, adminOnly, async (req, res, next) => {
    try {
        const { title, date, description, mandatory, sendNotification } = req.body;

        const drill = await DrillSchedule.create({
            title,
            date,
            description,
            mandatory: mandatory !== undefined ? mandatory : true,
            createdBy: req.user._id
        });

        // Optionally send notification
        if (sendNotification) {
            await Notification.create({
                title: `New Drill Scheduled: ${title}`,
                message: `${description}\nDate: ${new Date(date).toDateString()}${mandatory ? ' (Mandatory)' : ''}`,
                type: 'schedule',
                recipientId: 'all'
            });
        }

        res.status(201).json(drill);
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/drills/:id
// @desc    Update drill schedule
// @access  Admin only
router.put('/:id', protect, adminOnly, async (req, res, next) => {
    try {
        const drill = await DrillSchedule.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!drill) {
            return res.status(404).json({ message: 'Drill schedule not found' });
        }

        res.json(drill);
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/drills/:id
// @desc    Delete drill schedule
// @access  Admin only
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
    try {
        const drill = await DrillSchedule.findByIdAndDelete(req.params.id);

        if (!drill) {
            return res.status(404).json({ message: 'Drill schedule not found' });
        }

        res.json({ message: 'Drill schedule deleted' });
    } catch (error) {
        next(error);
    }
});

export default router;
