import express from 'express';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: 'Please provide username and password' });
        }

        // Find user (need to explicitly select password since it's excluded by default)
        const user = await User.findOne({ username: username.toLowerCase() })
            .select('+password')
            .populate('cadetId', 'regimentalNumber fullName rank');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                role: user.role,
                cadetId: user.cadetId?._id,
                rank: user.rank
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/register
// @desc    Register new admin (protected - admin only in production)
// @access  Public (for initial setup, should be protected later)
router.post('/register', async (req, res, next) => {
    try {
        const { username, password, name, role } = req.body;

        // Validate input
        if (!username || !password || !name) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Create user
        const user = await User.create({
            username: username.toLowerCase(),
            password,
            name,
            role: role || 'admin'
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
