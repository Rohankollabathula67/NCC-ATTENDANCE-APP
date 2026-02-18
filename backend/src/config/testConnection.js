import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
    try {
        console.log('🔄 Testing MongoDB connection...');
        console.log('📍 URI:', process.env.MONGODB_URI);

        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log('✅ Connection successful!');
        console.log('🏢 Host:', conn.connection.host);
        console.log('📊 Database:', conn.connection.name);
        console.log('🔌 Ready State:', conn.connection.readyState);

        await mongoose.connection.close();
        console.log('👋 Connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('💡 Make sure MongoDB is running on your system');
        console.error('💡 Try running: mongod');
        process.exit(1);
    }
};

testConnection();
