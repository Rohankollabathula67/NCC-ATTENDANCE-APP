import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Cadet from '../models/Cadet.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Notification from '../models/Notification.js';

dotenv.config();

// This script migrates data from localStorage format to MongoDB
// Run with: node src/config/migrateData.js

const migrateData = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Sample data structure (replace with actual localStorage export)
        const localStorageData = {
            cadets: [], // Paste your cadets array from localStorage here
            attendanceHistory: {}, // Paste your attendance history here
            notifications: [] // Paste your notifications here
        };

        console.log('\n📊 Migration Summary:');
        console.log(`Cadets to migrate: ${localStorageData.cadets.length}`);
        console.log(`Attendance dates: ${Object.keys(localStorageData.attendanceHistory).length}`);
        console.log(`Notifications: ${localStorageData.notifications.length}`);

        // Migrate Cadets
        if (localStorageData.cadets.length > 0) {
            console.log('\n👥 Migrating cadets...');
            for (const cadet of localStorageData.cadets) {
                try {
                    // Create cadet
                    const newCadet = await Cadet.create({
                        regimentalNumber: cadet.regimentalNumber,
                        fullName: cadet.fullName,
                        rank: cadet.rank,
                        wing: cadet.wing,
                        platoon: cadet.platoon,
                        joinDate: cadet.joinDate,
                        password: cadet.password || cadet.regimentalNumber
                    });

                    // Create user account for cadet
                    await User.create({
                        username: cadet.regimentalNumber.toLowerCase(),
                        password: cadet.password || cadet.regimentalNumber,
                        name: cadet.fullName,
                        role: 'cadet',
                        cadetId: newCadet._id,
                        rank: cadet.rank
                    });

                    console.log(`  ✓ Migrated: ${cadet.fullName}`);
                } catch (error) {
                    console.log(`  ✗ Failed: ${cadet.fullName} - ${error.message}`);
                }
            }
        }

        // Migrate Attendance
        if (Object.keys(localStorageData.attendanceHistory).length > 0) {
            console.log('\n📅 Migrating attendance records...');

            for (const [date, records] of Object.entries(localStorageData.attendanceHistory)) {
                for (const [cadetId, status] of Object.entries(records)) {
                    try {
                        // Find cadet by old ID (you may need to map old IDs to new MongoDB IDs)
                        const cadet = await Cadet.findOne({
                            regimentalNumber: cadetId // Adjust this based on your ID mapping
                        });

                        if (cadet) {
                            await Attendance.create({
                                date,
                                cadetId: cadet._id,
                                status
                            });
                        }
                    } catch (error) {
                        console.log(`  ✗ Failed attendance for ${date}: ${error.message}`);
                    }
                }
                console.log(`  ✓ Migrated attendance for ${date}`);
            }
        }

        // Migrate Notifications
        if (localStorageData.notifications.length > 0) {
            console.log('\n🔔 Migrating notifications...');
            for (const notification of localStorageData.notifications) {
                try {
                    await Notification.create({
                        title: notification.title,
                        message: notification.message,
                        type: notification.type,
                        recipientId: notification.recipientId,
                        read: notification.read,
                        timestamp: notification.timestamp
                    });
                    console.log(`  ✓ Migrated: ${notification.title}`);
                } catch (error) {
                    console.log(`  ✗ Failed: ${notification.title} - ${error.message}`);
                }
            }
        }

        // Create default admin user
        console.log('\n👤 Creating default admin user...');
        try {
            await User.create({
                username: 'admin',
                password: 'admin123', // CHANGE THIS IN PRODUCTION!
                name: 'Administrator',
                role: 'admin'
            });
            console.log('  ✓ Admin user created (username: admin, password: admin123)');
        } catch (error) {
            console.log('  ℹ Admin user may already exist');
        }

        console.log('\n✅ Migration completed!');
        console.log('\n💡 Next steps:');
        console.log('1. Verify data in MongoDB Compass');
        console.log('2. Start the backend server: npm run dev');
        console.log('3. Test the application');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

// Instructions for use:
console.log('📝 DATA MIGRATION SCRIPT');
console.log('========================\n');
console.log('To use this script:');
console.log('1. Open your browser console on the current app');
console.log('2. Run: JSON.stringify({ cadets: JSON.parse(localStorage.getItem("ncc_cadets_realtime")), attendanceHistory: JSON.parse(localStorage.getItem("ncc_attendance_realtime")), notifications: JSON.parse(localStorage.getItem("ncc_notifications_realtime")) })');
console.log('3. Copy the output');
console.log('4. Paste it into the localStorageData variable in this file');
console.log('5. Run: node src/config/migrateData.js\n');
console.log('Press Ctrl+C to cancel, or wait 5 seconds to start migration...\n');

setTimeout(() => {
    migrateData();
}, 5000);
