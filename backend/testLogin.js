const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const testLogin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster_management');
        console.log('✓ Connected to MongoDB');

        // Test admin credentials
        console.log('\n=== Testing Admin Credentials ===');
        const adminUser = await User.findOne({ username: 'admin' }).select('+password');

        if (adminUser) {
            console.log('Admin user found:');
            console.log('  Username:', adminUser.username);
            console.log('  Email:', adminUser.email);
            console.log('  Role:', adminUser.role);
            console.log('  Is Active:', adminUser.isActive);
            console.log('  Password (hashed):', adminUser.password);

            const isMatch = await adminUser.matchPassword('admin123');
            console.log('  Password "admin123" matches:', isMatch);
        } else {
            console.log('❌ Admin user NOT found');
        }

        // Test regular user credentials
        console.log('\n=== Testing Regular User Credentials ===');
        const regularUser = await User.findOne({ username: 'user' }).select('+password');

        if (regularUser) {
            console.log('Regular user found:');
            console.log('  Username:', regularUser.username);
            console.log('  Email:', regularUser.email);
            console.log('  Role:', regularUser.role);
            console.log('  Is Active:', regularUser.isActive);
            console.log('  Password (hashed):', regularUser.password);

            const isMatch = await regularUser.matchPassword('user123');
            console.log('  Password "user123" matches:', isMatch);
        } else {
            console.log('❌ Regular user NOT found');
        }

        await mongoose.connection.close();
        console.log('\n✓ Test completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

testLogin();
