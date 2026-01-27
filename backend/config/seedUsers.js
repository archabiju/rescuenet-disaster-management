const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const seedUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster_management');
        console.log('✓ Connected to MongoDB');

        // Check if admin exists
        const adminExists = await User.findOne({ username: 'admin' });

        if (adminExists) {
            console.log('✓ Admin user already exists');
        } else {
            // Create admin user
            const admin = await User.create({
                username: 'admin',
                email: 'admin@disaster.com',
                password: 'admin123',
                fullName: 'System Administrator',
                role: 'admin'
            });
            console.log('✓ Admin user created');
            console.log('  Username: admin');
            console.log('  Password: admin123');
        }

        // Check if demo user exists
        const userExists = await User.findOne({ username: 'user' });

        if (userExists) {
            console.log('✓ Demo user already exists');
        } else {
            // Create demo user
            const user = await User.create({
                username: 'user',
                email: 'user@disaster.com',
                password: 'user123',
                fullName: 'Demo User',
                role: 'user'
            });
            console.log('✓ Demo user created');
            console.log('  Username: user');
            console.log('  Password: user123');
        }

        console.log('\n✓ Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
