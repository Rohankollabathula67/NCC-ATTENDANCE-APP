import mongoose from 'mongoose';

const cadetSchema = new mongoose.Schema({
    regimentalNumber: {
        type: String,
        required: [true, 'Regimental number is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    rank: {
        type: String,
        enum: ['Cadet', 'Lance Corporal', 'Corporal', 'Sergeant', 'Under Officer', 'Senior Under Officer'],
        required: [true, 'Rank is required'],
        default: 'Cadet'
    },
    wing: {
        type: String,
        enum: ['Army', 'Navy', 'Air Force'],
        required: [true, 'Wing is required']
    },
    platoon: {
        type: String,
        required: [true, 'Platoon is required'],
        trim: true
    },
    joinDate: {
        type: Date,
        required: [true, 'Join date is required'],
        default: Date.now
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
cadetSchema.index({ regimentalNumber: 1 });
cadetSchema.index({ wing: 1, platoon: 1 });

// Virtual for attendance records
cadetSchema.virtual('attendanceRecords', {
    ref: 'Attendance',
    localField: '_id',
    foreignField: 'cadetId'
});

const Cadet = mongoose.model('Cadet', cadetSchema);

export default Cadet;
