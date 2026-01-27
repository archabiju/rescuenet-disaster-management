const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
require('dotenv').config();

const seedVehicles = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster_management');
        console.log('✓ Connected to MongoDB');

        // Clear existing vehicles
        await Vehicle.deleteMany({});
        console.log('✓ Cleared existing vehicles');

        // Sample vehicle data - matching Vehicle model schema
        const vehicles = [
            {
                vehicle_no: 'KL-01-AB-1234',
                type: 'ambulance',
                capacity: 4,
                status: 'available',
                last_maintenance: new Date('2024-01-15')
            },
            {
                vehicle_no: 'KL-07-CD-5678',
                type: 'truck',
                capacity: 8,
                status: 'in_use',
                last_maintenance: new Date('2024-01-10')
            },
            {
                vehicle_no: 'KL-14-EF-9012',
                type: 'van',
                capacity: 10,
                status: 'available',
                last_maintenance: new Date('2024-01-20')
            },
            {
                vehicle_no: 'KL-03-GH-3456',
                type: 'ambulance',
                capacity: 4,
                status: 'maintenance',
                last_maintenance: new Date('2024-01-05')
            },
            {
                vehicle_no: 'KL-10-IJ-7890',
                type: 'truck',
                capacity: 15,
                status: 'available',
                last_maintenance: new Date('2024-01-18')
            },
            {
                vehicle_no: 'KL-02-KL-2345',
                type: 'van',
                capacity: 12,
                status: 'in_use',
                last_maintenance: new Date('2024-01-12')
            },
            {
                vehicle_no: 'KL-08-MN-6789',
                type: 'ambulance',
                capacity: 6,
                status: 'available',
                last_maintenance: new Date('2024-01-22')
            },
            {
                vehicle_no: 'KL-05-OP-0123',
                type: 'boat',
                capacity: 20,
                status: 'available',
                last_maintenance: new Date('2024-01-16')
            },
            {
                vehicle_no: 'KL-11-QR-4567',
                type: 'truck',
                capacity: 20,
                status: 'in_use',
                last_maintenance: new Date('2024-01-08')
            },
            {
                vehicle_no: 'KL-13-ST-8901',
                type: 'helicopter',
                capacity: 8,
                status: 'available',
                last_maintenance: new Date('2024-01-19')
            },
            {
                vehicle_no: 'KL-04-UV-2468',
                type: 'van',
                capacity: 10,
                status: 'available',
                last_maintenance: new Date('2024-01-21')
            },
            {
                vehicle_no: 'KL-09-WX-1357',
                type: 'ambulance',
                capacity: 4,
                status: 'maintenance',
                last_maintenance: new Date('2024-01-03')
            }
        ];

        // Insert vehicles
        const createdVehicles = await Vehicle.insertMany(vehicles);
        console.log(`✓ Created ${createdVehicles.length} vehicles`);

        console.log('\n=== Sample Vehicles Created ===');
        console.log(`Total: ${createdVehicles.length}`);
        console.log('Vehicle Types:');
        console.log('  - Ambulances: 4');
        console.log('  - Trucks: 3');
        console.log('  - Vans: 3');
        console.log('  - Boats: 1');
        console.log('  - Helicopters: 1');
        console.log('\nStatus Distribution:');
        console.log('  - Available: 7');
        console.log('  - In Use: 3');
        console.log('  - Maintenance: 2');

        await mongoose.connection.close();
        console.log('\n✓ Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding vehicles:', error);
        process.exit(1);
    }
};

seedVehicles();
