import express from 'express';
import Attendance from '../models/Attendance.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/attendance
// @desc    Get attendance records (with optional date filter)
// @access  Protected
router.get('/', protect, async (req, res, next) => {
    try {
        const { date, startDate, endDate } = req.query;

        let filter = {};

        if (date) {
            filter.date = date;
        } else if (startDate && endDate) {
            filter.date = { $gte: startDate, $lte: endDate };
        }

        const records = await Attendance.find(filter)
            .populate('cadetId', 'regimentalNumber fullName rank wing platoon')
            .sort({ date: -1, 'cadetId.regimentalNumber': 1 });

        res.json(records);
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/attendance/date/:date
// @desc    Get attendance for specific date
// @access  Protected
router.get('/date/:date', protect, async (req, res, next) => {
    try {
        const records = await Attendance.getByDate(req.params.date);
        res.json(records);
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/attendance/cadet/:cadetId
// @desc    Get cadet's attendance history
// @access  Protected
router.get('/cadet/:cadetId', protect, async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 30;
        const records = await Attendance.getCadetHistory(req.params.cadetId, limit);
        res.json(records);
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/attendance
// @desc    Mark attendance (bulk operation for a date)
// @access  Admin only
router.post('/', protect, adminOnly, async (req, res, next) => {
    try {
        const { date, records } = req.body; // records: { cadetId: status }

        if (!date || !records) {
            return res.status(400).json({ message: 'Date and records are required' });
        }

        const attendanceRecords = [];

        // Process each cadet's attendance
        for (const [cadetId, status] of Object.entries(records)) {
            // Update or create attendance record
            const record = await Attendance.findOneAndUpdate(
                { date, cadetId },
                {
                    status,
                    markedBy: req.user._id,
                    markedAt: new Date()
                },
                { upsert: true, new: true }
            );

            attendanceRecords.push(record);
        }

        res.json({
            message: 'Attendance marked successfully',
            count: attendanceRecords.length,
            records: attendanceRecords
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/attendance/:id
// @desc    Update single attendance record
// @access  Admin only
router.put('/:id', protect, adminOnly, async (req, res, next) => {
    try {
        const { status, notes } = req.body;

        const record = await Attendance.findByIdAndUpdate(
            req.params.id,
            { status, notes, markedBy: req.user._id, markedAt: new Date() },
            { new: true, runValidators: true }
        ).populate('cadetId', 'regimentalNumber fullName');

        if (!record) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        res.json(record);
    } catch (error) {
        next(error);
    }
});

export default router;
