import mongoose from 'mongoose';

const drillScheduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: [true, 'Date is required'],
        index: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    mandatory: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for chronological queries
drillScheduleSchema.index({ date: 1 });

// Static method to get upcoming drills
drillScheduleSchema.statics.getUpcoming = function () {
    const today = new Date().toISOString().split('T')[0];
    return this.find({ date: { $gte: today } })
        .sort({ date: 1 })
        .populate('createdBy', 'name');
};

const DrillSchedule = mongoose.model('DrillSchedule', drillScheduleSchema);

export default DrillSchedule;
