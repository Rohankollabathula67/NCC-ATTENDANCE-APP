import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    date: {
        type: String, // Format: YYYY-MM-DD
        required: [true, 'Date is required']
    },
    cadetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cadet',
        required: [true, 'Cadet ID is required']
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'On Leave', 'Special Duty'],
        required: [true, 'Status is required'],
        default: 'Absent'
    },
    notes: {
        type: String,
        trim: true
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    markedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
attendanceSchema.index({ date: 1, cadetId: 1 }, { unique: true });

// Static method to get attendance for a specific date
attendanceSchema.statics.getByDate = function (date) {
    return this.find({ date }).populate('cadetId', 'regimentalNumber fullName rank wing platoon');
};

// Static method to get cadet's attendance history
attendanceSchema.statics.getCadetHistory = function (cadetId, limit = 30) {
    return this.find({ cadetId })
        .sort({ date: -1 })
        .limit(limit)
        .select('date status notes markedAt');
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
