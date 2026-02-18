import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['info', 'alert', 'schedule'],
        default: 'info'
    },
    recipientId: {
        type: String, // 'all' or specific user ID
        required: true,
        default: 'all'
    },
    read: {
        type: Boolean,
        default: false,
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipientId: 1, read: 1, timestamp: -1 });

// Static method to get unread notifications
notificationSchema.statics.getUnread = function (recipientId) {
    return this.find({
        $or: [
            { recipientId: recipientId },
            { recipientId: 'all' }
        ],
        read: false
    }).sort({ timestamp: -1 });
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
