const { Pool } = require('pg');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
});

// MongoDB Schema for Zones
const zoneSchema = new mongoose.Schema({
    name: String,
    center_lat: Number,
    center_lng: Number,
    radius_meters: Number,
    severity: String,
    disaster_type: String,
    status: String,
    affected_population: Number,
    description: String,
    declared_at: { type: Date, default: Date.now }
}, { collection: 'zones' });

const DisasterZone = mongoose.model('DisasterZone', zoneSchema);

async function seedData() {
    try {
        console.log('🌱 Starting Seed Process (Safe Mode)...');

        // --- CONNECT MONGO ---
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster_management');
        console.log('✅ Connected to MongoDB');

        // --- SEED POSTGRES ---
        console.log('🔌 Connected to PostgreSQL');

        // 1. Users (Team Leads)
        console.log('...Seeding Users');
        const userRes = await pool.query(`
      INSERT INTO users (full_name, email, password_hash, role, phone)
      VALUES 
      ('Rahul Nair', 'rahul@rescuenet.com', 'hash123', 'responder', '9876543210'),
      ('Priya Thomas', 'priya@rescuenet.com', 'hash123', 'responder', '9876543211'),
      ('Arjun Reddy', 'arjun@rescuenet.com', 'hash123', 'responder', '9876543212')
      ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
      RETURNING user_id, full_name;
    `);

        // Fetch all needed users to be sure we have IDs
        const allUsersRes = await pool.query('SELECT user_id, email FROM users WHERE email IN ($1, $2, $3)',
            ['rahul@rescuenet.com', 'priya@rescuenet.com', 'arjun@rescuenet.com']);
        const users = allUsersRes.rows;


        // 2. Resource Centers
        console.log('...Seeding Resource Centers');
        const existingCenters = await pool.query('SELECT name FROM resource_centers');
        const existingCenterNames = new Set(existingCenters.rows.map(r => r.name));

        const centersToInsert = [
            ['Kochi Central Hub', 'Kochi, Kerala', 9.9312, 76.2673, 'warehouse'],
            ['Trivandrum Depot', 'Thiruvananthapuram, Kerala', 8.5241, 76.9366, 'distribution_center'],
            ['Alleppey Boat House', 'Alappuzha, Kerala', 9.4981, 76.3388, 'logistics_hub']
        ];

        for (const c of centersToInsert) {
            if (!existingCenterNames.has(c[0])) {
                await pool.query('INSERT INTO resource_centers (name, location, lat, lng, type) VALUES ($1, $2, $3, $4, $5)', c);
            }
        }

        const centersRes = await pool.query('SELECT center_id, name FROM resource_centers');
        const centers = centersRes.rows;

        // 3. Disaster Zones (Postgres)
        console.log('...Seeding Postgres Zones');
        const existingZones = await pool.query('SELECT name FROM disaster_zones');
        const existingZoneNames = new Set(existingZones.rows.map(r => r.name));

        const zonesToInsert = [
            ['Wayanad Landslide Area', 'critical', 'landslide', 'active', 11.6854, 76.1320, 5000],
            ['Idukki Flood Zone', 'high', 'flood', 'active', 9.8494, 76.9804, 8000],
            ['Kozhikode Coastal Watch', 'medium', 'cyclone', 'active', 11.2588, 75.7804, 3000]
        ];

        for (const z of zonesToInsert) {
            if (!existingZoneNames.has(z[0])) {
                await pool.query('INSERT INTO disaster_zones (name, severity, disaster_type, status, lat, lng, radius) VALUES ($1, $2, $3, $4, $5, $6, $7)', z);
            }
        }

        const pgZonesRes = await pool.query('SELECT zone_id, name FROM disaster_zones');
        const pgZones = pgZonesRes.rows;

        // 4. Mongo Zones (For UI)
        console.log('...Seeding MongoDB Zones');
        const mongoDocs = [
            {
                name: 'Wayanad Landslide Area',
                center_lat: 11.6854, center_lng: 76.1320, radius_meters: 5000,
                severity: 'critical', disaster_type: 'landslide', status: 'active',
                affected_population: 1500, description: 'Landslide warning in Meppadi region.'
            },
            {
                name: 'Idukki Flood Zone',
                center_lat: 9.8494, center_lng: 76.9804, radius_meters: 8000,
                severity: 'high', disaster_type: 'flood', status: 'active',
                affected_population: 5000, description: 'Rising water levels in Periyar river.'
            },
            {
                name: 'Kozhikode Coastal Watch',
                center_lat: 11.2588, center_lng: 75.7804, radius_meters: 3000,
                severity: 'medium', disaster_type: 'cyclone', status: 'active',
                affected_population: 2000, description: 'High wind alert for coastal fishermen.'
            }
        ];

        for (const doc of mongoDocs) {
            const exists = await DisasterZone.findOne({ name: doc.name });
            if (!exists) await DisasterZone.create(doc);
        }


        // 5. Rescue Teams (Postgres)
        console.log('...Seeding Rescue Teams');
        const existingTeams = await pool.query('SELECT team_name FROM rescue_teams');
        const existingTeamNames = new Set(existingTeams.rows.map(r => r.team_name));

        if (users.length >= 3 && centers.length >= 1) {
            const teamsToInsert = [
                ['Alpha Response', users[0].user_id, 'deployed', centers[0].center_id, 'water_rescue'],
                ['Bravo Medical', users[1].user_id, 'standby', centers[Math.min(1, centers.length - 1)].center_id, 'medical'],
                ['Charlie Logistics', users[2].user_id, 'active', centers[0].center_id, 'logistics']
            ];

            for (const t of teamsToInsert) {
                if (!existingTeamNames.has(t[0])) {
                    await pool.query('INSERT INTO rescue_teams (team_name, lead_user_id, status, home_center_id, specialization) VALUES ($1, $2, $3, $4, $5)', t);
                }
            }
        }

        // 6. Shelters (Postgres)
        console.log('...Seeding Shelters');
        const existingShelters = await pool.query('SELECT name FROM shelters');
        const existingShelterNames = new Set(existingShelters.rows.map(r => r.name));

        if (pgZones.length >= 3) {
            const sheltersToInsert = [
                ['Meppadi High School', 'Meppadi, Wayanad', 11.6800, 76.1300, 500, 120, pgZones[0].zone_id, 'active'],
                ['Idukki Community Hall', 'Painavu, Idukki', 9.8500, 76.9800, 300, 45, pgZones[1].zone_id, 'active'],
                ['Kozhikode Beach Hall', 'Beach Rd, Kozhikode', 11.2500, 75.7700, 1000, 0, pgZones[2].zone_id, 'standby']
            ];

            for (const s of sheltersToInsert) {
                if (!existingShelterNames.has(s[0])) {
                    await pool.query('INSERT INTO shelters (name, address, lat, lng, capacity, current_occupancy, zone_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', s);
                }
            }
        }

        // 7. Citizen Requests (Postgres)
        console.log('...Seeding Citizen Requests');
        // Just add 3 new ones if count is low (< 5), to avoid spamming
        const reqCount = await pool.query('SELECT COUNT(*) FROM citizen_requests');
        if (parseInt(reqCount.rows[0].count) < 5 && pgZones.length >= 3) {
            await pool.query(`
          INSERT INTO citizen_requests (reporter_name, reporter_phone, request_type, description, priority, status, zone_id, lat, lng)
          VALUES 
          ('Anil Kumar', '9998887776', 'evacuation', 'Water entered ground floor, 5 people stranded.', 'critical', 'open', $1, 11.6810, 76.1310),
          ('Mary John', '8887776665', 'medical', 'Insulin needed urgently for diabetic patient.', 'high', 'open', $2, 9.8510, 76.9810),
          ('Jose P', '7776665554', 'food', 'Need food packets for 3 families.', 'medium', 'in_progress', $3, 11.2510, 75.7710)
        `, [pgZones[0].zone_id, pgZones[1].zone_id, pgZones[2].zone_id]);
        }

        // 8. Vehicles (Postgres) - Corrected Column Name
        console.log('...Seeding Vehicles');
        const existingVehicles = await pool.query('SELECT vehicle_no FROM vehicles');
        const existingVehicleNos = new Set(existingVehicles.rows.map(r => r.vehicle_no));

        // Get team IDs for assignment
        const teamsRes2 = await pool.query('SELECT team_id, team_name FROM rescue_teams');
        const teams2 = teamsRes2.rows;

        if (teams2.length > 0 && centers.length > 0) {
            const vehiclesToInsert = [
                ['KL-01-AB-1234', 'ambulance', 4, centers[0].center_id, teams2[0].team_id, 'deployed'],
                ['KL-01-CD-5678', 'truck', 2000, centers[1].center_id, teams2[1].team_id, 'available'],
                ['KL-01-EF-9012', 'boat', 10, centers[0].center_id, teams2[0].team_id, 'deployed']
            ];

            for (const v of vehiclesToInsert) {
                if (!existingVehicleNos.has(v[0])) {
                    // IMPORTANT: schema says vehicle_type, NOT type
                    await pool.query('INSERT INTO vehicles (vehicle_no, vehicle_type, capacity, current_center_id, assigned_team_id, status) VALUES ($1, $2, $3, $4, $5, $6)', v);
                }
            }
        }

        console.log('🎉 Database Population Complete!');
    } catch (err) {
        console.error('Error seeding data:', err);
    } finally {
        await pool.end();
        await mongoose.disconnect();
    }
}

seedData();
