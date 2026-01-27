const mongoose = require('mongoose');
require('dotenv').config();

// Define schemas inline
const ResourceCenterSchema = new mongoose.Schema({
    name: String,
    location_lat: Number,
    location_lng: Number,
    address: String,
    capacity: Number,
    current_occupancy: Number,
    manager_name: String,
    contact_phone: String,
    status: String
}, { timestamps: true });

const ResourceInventorySchema = new mongoose.Schema({
    center_id: mongoose.Schema.Types.ObjectId,
    center_name: String,
    resource_id: mongoose.Schema.Types.ObjectId,
    resource_name: String,
    quantity: Number,
    unit: String,
    critical_threshold: Number,
    status: { type: String, default: 'available' }
}, { timestamps: true });

const ResourceSchema = new mongoose.Schema({
    name: String,
    category: String,
    unit: String
}, { timestamps: true });

const ResourceCenter = mongoose.model('ResourceCenter', ResourceCenterSchema);
const ResourceInventory = mongoose.model('ResourceInventory', ResourceInventorySchema);
const Resource = mongoose.model('Resource', ResourceSchema);

const seedResources = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster_management');
        console.log('✓ Connected to MongoDB');

        // Clear existing
        await ResourceCenter.deleteMany({});
        await ResourceInventory.deleteMany({});
        await Resource.deleteMany({});
        console.log('✓ Cleared existing data');

        // Create Resource Centers
        const centers = await ResourceCenter.insertMany([
            {
                name: 'Central Relief Center',
                location_lat: 8.5241,
                location_lng: 76.9366,
                address: 'Thiruvananthapuram, Kerala',
                capacity: 5000,
                current_occupancy: 3200,
                manager_name: 'Rajesh Kumar',
                contact_phone: '+91-9876543210',
                status: 'active'
            },
            {
                name: 'North District Relief Hub',
                location_lat: 11.2588,
                location_lng: 75.7804,
                address: 'Kozhikode, Kerala',
                capacity: 3000,
                current_occupancy: 1800,
                manager_name: 'Priya Sharma',
                contact_phone: '+91-9876543211',
                status: 'active'
            },
            {
                name: 'Coastal Emergency Center',
                location_lat: 9.9312,
                location_lng: 76.2673,
                address: 'Kochi, Kerala',
                capacity: 4000,
                current_occupancy: 2500,
                manager_name: 'Anand Menon',
                contact_phone: '+91-9876543212',
                status: 'active'
            }
        ]);
        console.log('✓ Created 3 resource centers');

        // Create basic resource types
        const resources = await Resource.insertMany([
            { name: 'Drinking Water', category: 'food_water', unit: 'liters' },
            { name: 'Rice', category: 'food_water', unit: 'kg' },
            { name: 'Wheat Flour', category: 'food_water', unit: 'kg' },
            { name: 'Canned Food', category: 'food_water', unit: 'units' },
            { name: 'Blankets', category: 'shelter', unit: 'units' },
            { name: 'Tents', category: 'shelter', unit: 'units' },
            { name: 'Mattresses', category: 'shelter', unit: 'units' },
            { name: 'First Aid Kits', category: 'medical', unit: 'kits' },
            { name: 'Medicines', category: 'medical', unit: 'boxes' },
            { name: 'Bandages', category: 'medical', unit: 'rolls' },
            { name: 'Flashlights', category: 'equipment', unit: 'units' },
            { name: 'Batteries', category: 'equipment', unit: 'packs' },
            { name: 'Clothes (Adult)', category: 'clothing', unit: 'sets' },
            { name: 'Clothes (Children)', category: 'clothing', unit: 'sets' }
        ]);
        console.log('✓ Created 14 resource types');

        // Create inventories
        const inventories = [];

        // Center 1
        inventories.push(
            { center_id: centers[0]._id, center_name: centers[0].name, resource_id: resources[0]._id, resource_name: 'Drinking Water', quantity: 5000, unit: 'liters', critical_threshold: 1000 },
            { center_id: centers[0]._id, center_name: centers[0].name, resource_id: resources[1]._id, resource_name: 'Rice', quantity: 2000, unit: 'kg', critical_threshold: 500 },
            { center_id: centers[0]._id, center_name: centers[0].name, resource_id: resources[4]._id, resource_name: 'Blankets', quantity: 1200, unit: 'units', critical_threshold: 300 },
            { center_id: centers[0]._id, center_name: centers[0].name, resource_id: resources[7]._id, resource_name: 'First Aid Kits', quantity: 300, unit: 'kits', critical_threshold: 50 }
        );

        // Center 2
        inventories.push(
            { center_id: centers[1]._id, center_name: centers[1].name, resource_id: resources[0]._id, resource_name: 'Drinking Water', quantity: 3000, unit: 'liters', critical_threshold: 800 },
            { center_id: centers[1]._id, center_name: centers[1].name, resource_id: resources[2]._id, resource_name: 'Wheat Flour', quantity: 1500, unit: 'kg', critical_threshold: 400 },
            { center_id: centers[1]._id, center_name: centers[1].name, resource_id: resources[5]._id, resource_name: 'Tents', quantity: 150, unit: 'units', critical_threshold: 30 },
            { center_id: centers[1]._id, center_name: centers[1].name, resource_id: resources[12]._id, resource_name: 'Clothes (Adult)', quantity: 600, unit: 'sets', critical_threshold: 150 }
        );

        // Center 3
        inventories.push(
            { center_id: centers[2]._id, center_name: centers[2].name, resource_id: resources[0]._id, resource_name: 'Drinking Water', quantity: 4000, unit: 'liters', critical_threshold: 900 },
            { center_id: centers[2]._id, center_name: centers[2].name, resource_id: resources[3]._id, resource_name: 'Canned Food', quantity: 800, unit: 'units', critical_threshold: 200 },
            { center_id: centers[2]._id, center_name: centers[2].name, resource_id: resources[8]._id, resource_name: 'Medicines', quantity: 500, unit: 'boxes', critical_threshold: 100 },
            { center_id: centers[2]._id, center_name: centers[2].name, resource_id: resources[13]._id, resource_name: 'Clothes (Children)', quantity: 400, unit: 'sets', critical_threshold: 100 }
        );

        await ResourceInventory.insertMany(inventories);
        console.log('✓ Created 12 inventory items');

        console.log('\n✅ Resources seed completed successfully!');
        console.log(`   Centers: 3`);
        console.log(`   Resources: 14`);
        console.log(`   Inventories: 12\n`);

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding resources:', error);
        process.exit(1);
    }
};

seedResources();
