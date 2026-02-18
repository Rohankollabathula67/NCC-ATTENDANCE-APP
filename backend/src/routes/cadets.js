import express from 'express';
import Cadet from '../models/Cadet.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/cadets
// @desc    Get all cadets
// @access  Protected
router.get('/', protect, async (req, res, next) => {
    try {
        const { wing, platoon, rank } = req.query;

        // Build filter
        const filter = { isActive: true };
        if (wing) filter.wing = wing;
        if (platoon) filter.platoon = platoon;
        if (rank) filter.rank = rank;

        const cadets = await Cadet.find(filter).sort({ regimentalNumber: 1 });

        res.json(cadets);
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/cadets/:id
// @desc    Get single cadet
// @access  Protected
router.get('/:id', protect, async (req, res, next) => {
    try {
        const cadet = await Cadet.findById(req.params.id);

        if (!cadet) {
            return res.status(404).json({ message: 'Cadet not found' });
        }

        res.json(cadet);
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/cadets
// @desc    Create new cadet
// @access  Admin only
router.post('/', protect, adminOnly, async (req, res, next) => {
    try {
        const { regimentalNumber, fullName, rank, wing, platoon, joinDate, password } = req.body;

        // Create cadet
        const cadet = await Cadet.create({
            regimentalNumber,
            fullName,
            rank,
            wing,
            platoon,
            joinDate,
            password: password || regimentalNumber // Default password is regimental number
        });

        // Create user account for cadet
        await User.create({
            username: regimentalNumber.toLowerCase(),
            password: password || regimentalNumber,
            name: fullName,
            role: 'cadet',
            cadetId: cadet._id,
            rank: rank
        });

        res.status(201).json(cadet);
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/cadets/:id
// @desc    Update cadet
// @access  Admin only
router.put('/:id', protect, adminOnly, async (req, res, next) => {
    try {
        const cadet = await Cadet.findById(req.params.id);

        if (!cadet) {
            return res.status(404).json({ message: 'Cadet not found' });
        }

        // Update cadet
        Object.assign(cadet, req.body);
        await cadet.save();

        // Update associated user if rank or name changed
        if (req.body.rank || req.body.fullName) {
            await User.findOneAndUpdate(
                { cadetId: cadet._id },
                {
                    rank: req.body.rank || cadet.rank,
                    name: req.body.fullName || cadet.fullName
                }
            );
        }

        res.json(cadet);
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/cadets/:id
// @desc    Delete cadet (soft delete)
// @access  Admin only
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
    try {
        const cadet = await Cadet.findById(req.params.id);

        if (!cadet) {
            return res.status(404).json({ message: 'Cadet not found' });
        }

        // Soft delete
        cadet.isActive = false;
        await cadet.save();

        // Also deactivate user account
        await User.findOneAndUpdate(
            { cadetId: cadet._id },
            { isActive: false }
        );

        res.json({ message: 'Cadet discharged successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
