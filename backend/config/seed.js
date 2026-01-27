const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const DisasterZone = require('../models/DisasterZone');
const CitizenRequest = require('../models/CitizenRequest');
const RescueTeam = require('../models/RescueTeam');
const Shelter = require('../models/Shelter');
const ResourceCenter = require('../models/ResourceCenter');
const Resource = require('../models/Resource');
const Vehicle = require('../models/Vehicle');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await DisasterZone.deleteMany({});
    await CitizenRequest.deleteMany({});
    await RescueTeam.deleteMany({});
    await Shelter.deleteMany({});
    await ResourceCenter.deleteMany({});
    await Resource.deleteMany({});
    await Vehicle.deleteMany({});

    // Seed Disaster Zones
    console.log('Seeding disaster zones...');
    const zones = await DisasterZone.insertMany([
      {
        name: 'Coastal Region A',
        center_lat: 8.524139,
        center_lng: 76.936638,
        radius_meters: 5000,
        severity: 'high',
        disaster_type: 'flood',
        status: 'active',
        affected_population: 15000,
        description: 'Severe flooding in coastal areas'
      },
      {
        name: 'Mountain District B',
        center_lat: 10.850516,
        center_lng: 76.271080,
        radius_meters: 8000,
        severity: 'medium',
        disaster_type: 'earthquake',
        status: 'active',
        affected_population: 8000,
        description: 'Earthquake aftershocks reported'
      },
      {
        name: 'Urban Area C',
        center_lat: 9.931233,
        center_lng: 76.267303,
        radius_meters: 3000,
        severity: 'low',
        disaster_type: 'cyclone',
        status: 'contained',
        affected_population: 3000,
        description: 'Post-cyclone recovery in progress'
      }
    ]);

    // Seed Shelters
    console.log('Seeding shelters...');
    await Shelter.insertMany([
      {
        name: 'Central Community Hall',
        address: '123 Main St, Kollam',
        lat: 8.524139,
        lng: 76.936638,
        capacity: 500,
        current_occupancy: 380,
        zone_id: zones[0]._id,
        status: 'active',
        facilities: ['Medical', 'Food', 'Water', 'Beds']
      },
      {
        name: 'Sports Complex Shelter',
        address: '456 Hill Rd, Idukki',
        lat: 10.850516,
        lng: 76.271080,
        capacity: 800,
        current_occupancy: 620,
        zone_id: zones[1]._id,
        status: 'active',
        facilities: ['Medical', 'Food', 'Water']
      },
      {
        name: 'School Gymnasium',
        address: '789 School Lane',
        lat: 9.931233,
        lng: 76.267303,
        capacity: 300,
        current_occupancy: 150,
        zone_id: zones[2]._id,
        status: 'active',
        facilities: ['Food', 'Water']
      }
    ]);

    // Seed Resource Centers
    console.log('Seeding resource centers...');
    const centers = await ResourceCenter.insertMany([
      {
        name: 'Central Warehouse',
        lat: 8.524139,
        lng: 76.936638,
        address: 'Industrial Area, Kollam',
        contact_person: 'Rajesh Kumar',
        contact_phone: '+91-9876543210',
        operational_status: 'active'
      },
      {
        name: 'Northern Supply Depot',
        lat: 10.850516,
        lng: 76.271080,
        address: 'NH Road, Idukki',
        contact_person: 'Priya Menon',
        contact_phone: '+91-9876543211',
        operational_status: 'active'
      }
    ]);

    // Seed Resources
    console.log('Seeding resources...');
    const resources = await Resource.insertMany([
      {
        code: 'WATER_BOTTLE',
        name: 'Water Bottles',
        category: 'food',
        unit: 'units',
        critical_threshold: 1000,
        inventories: [
          { center_id: centers[0]._id, quantity: 10000 },
          { center_id: centers[1]._id, quantity: 5000 }
        ]
      },
      {
        code: 'MEDKIT_BASIC',
        name: 'Basic Medical Kit',
        category: 'medical',
        unit: 'kits',
        critical_threshold: 50,
        inventories: [
          { center_id: centers[0]._id, quantity: 500 }
        ]
      },
      {
        code: 'BLANKET',
        name: 'Emergency Blankets',
        category: 'shelter',
        unit: 'units',
        critical_threshold: 200,
        inventories: [
          { center_id: centers[1]._id, quantity: 2000 }
        ]
      },
      {
        code: 'FOOD_PACK',
        name: 'Food Packets',
        category: 'food',
        unit: 'packets',
        critical_threshold: 500,
        inventories: [
          { center_id: centers[1]._id, quantity: 3000 }
        ]
      }
    ]);

    // Seed Rescue Teams
    console.log('Seeding rescue teams...');
    const teams = await RescueTeam.insertMany([
      {
        team_name: 'Alpha Team',
        status: 'deployed',
        home_center_id: centers[0]._id,
        specialization: 'search-rescue',
        members: []
      },
      {
        team_name: 'Bravo Team',
        status: 'deployed',
        home_center_id: centers[1]._id,
        specialization: 'medical',
        members: []
      },
      {
        team_name: 'Charlie Team',
        status: 'available',
        home_center_id: centers[0]._id,
        specialization: 'evacuation',
        members: []
      }
    ]);

    // Seed Vehicles
    console.log('Seeding vehicles...');
    await Vehicle.insertMany([
      {
        vehicle_no: 'KL-01-1234',
        type: 'ambulance',
        capacity: 4,
        assigned_team_id: teams[0]._id,
        current_center_id: centers[0]._id,
        status: 'in_use'
      },
      {
        vehicle_no: 'KL-02-5678',
        type: 'truck',
        capacity: 20,
        assigned_team_id: teams[1]._id,
        current_center_id: centers[1]._id,
        status: 'in_use'
      },
      {
        vehicle_no: 'KL-03-9012',
        type: 'van',
        capacity: 8,
        assigned_team_id: teams[2]._id,
        current_center_id: centers[0]._id,
        status: 'available'
      }
    ]);

    // Seed Citizen Requests
    console.log('Seeding citizen requests...');
    await CitizenRequest.insertMany([
      {
        reporter_name: 'Ramesh Kumar',
        reporter_phone: '+91-9876543220',
        description: 'Family of 5 needs medical attention',
        request_type: 'medical',
        lat: 8.524139,
        lng: 76.936638,
        zone_id: zones[0]._id,
        priority: 'high',
        status: 'in_progress'
      },
      {
        reporter_name: 'Lakshmi Nair',
        reporter_phone: '+91-9876543221',
        description: 'Need food and water supplies',
        request_type: 'supplies',
        lat: 10.850516,
        lng: 76.271080,
        zone_id: zones[1]._id,
        priority: 'medium',
        status: 'assigned'
      },
      {
        reporter_name: 'Arun Das',
        reporter_phone: '+91-9876543222',
        description: 'Request evacuation from flooded area',
        request_type: 'evacuation',
        lat: 9.931233,
        lng: 76.267303,
        zone_id: zones[2]._id,
        priority: 'high',
        status: 'open'
      }
    ]);

    console.log('✓ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();