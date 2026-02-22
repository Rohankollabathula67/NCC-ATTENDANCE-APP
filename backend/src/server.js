import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import cadetRoutes from './routes/cadets.js';
import attendanceRoutes from './routes/attendance.js';
import notificationRoutes from './routes/notifications.js';
import drillRoutes from './routes/drills.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet()); // Security headers

// CORS - allow frontend origin from env or fallback to localhost in dev
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    credentials: true
}));

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Logging

// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'NCC Attendance API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cadets', cadetRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/drills', drillRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

export default app;
