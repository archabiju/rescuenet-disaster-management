/**
 * SQLite Routes for RescueNet
 * API endpoints to access SQLite database
 */
const express = require('express');
const router = express.Router();
const sqlite = require('../../config/sqlite');

// ============================================================
// DATABASE INFO & INITIALIZATION
// ============================================================

/**
 * GET /api/sqlite/status - Check database connection
 */
router.get('/status', async (req, res) => {
    try {
        const result = await sqlite.testConnection();
        res.json({
            database: 'SQLite',
            ...result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/sqlite/init - Initialize database with schema and data
 */
router.post('/init', async (req, res) => {
    try {
        const result = await sqlite.initializeDatabase();
        res.json({
            database: 'SQLite',
            ...result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/sqlite/tables - Get list of all tables
 */
router.get('/tables', async (req, res) => {
    try {
        const tables = await sqlite.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        res.json({
            database: 'SQLite',
            count: tables.length,
            tables: tables.map(t => t.name)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// USERS
// ============================================================

router.get('/users', async (req, res) => {
    try {
        const users = await sqlite.all('SELECT * FROM users ORDER BY user_id');
        res.json({ database: 'SQLite', count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// DISASTER ZONES
// ============================================================

router.get('/zones', async (req, res) => {
    try {
        const zones = await sqlite.all('SELECT * FROM disaster_zones ORDER BY severity DESC');
        res.json({ database: 'SQLite', count: zones.length, data: zones });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/zones', async (req, res) => {
    try {
        const { name, center_lat, center_lng, radius_meters, severity, status, type, type_of_help } = req.body;
        const result = await sqlite.run(
            `INSERT INTO disaster_zones (name, center_lat, center_lng, radius_meters, severity, declared_at, status, type, type_of_help) 
             VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?, ?)`,
            [name, center_lat, center_lng, radius_meters, severity, status, type, type_of_help]
        );
        res.json({ database: 'SQLite', success: true, id: result.lastID });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// SHELTERS
// ============================================================

router.get('/shelters', async (req, res) => {
    try {
        const shelters = await sqlite.all(`
            SELECT s.*, dz.name as zone_name 
            FROM shelters s 
            LEFT JOIN disaster_zones dz ON s.zone_id = dz.zone_id
            ORDER BY s.shelter_id
        `);
        res.json({ database: 'SQLite', count: shelters.length, data: shelters });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/shelters', async (req, res) => {
    try {
        const { name, address, lat, lng, capacity, current_occupancy, zone_id } = req.body;
        const result = await sqlite.run(
            `INSERT INTO shelters (name, address, lat, lng, capacity, current_occupancy, zone_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, address, lat, lng, capacity, current_occupancy || 0, zone_id]
        );
        res.json({ database: 'SQLite', success: true, id: result.lastID });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// RESCUE TEAMS
// ============================================================

router.get('/teams', async (req, res) => {
    try {
        const teams = await sqlite.all(`
            SELECT rt.*, u.full_name as lead_name, rc.name as home_center_name
            FROM rescue_teams rt
            LEFT JOIN users u ON rt.lead_user_id = u.user_id
            LEFT JOIN resource_centers rc ON rt.home_center_id = rc.center_id
            ORDER BY rt.team_id
        `);
        res.json({ database: 'SQLite', count: teams.length, data: teams });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/teams', async (req, res) => {
    try {
        const { team_name, lead_user_id, status, home_center_id, phone_number } = req.body;
        const result = await sqlite.run(
            `INSERT INTO rescue_teams (team_name, lead_user_id, status, home_center_id, phone_number) 
             VALUES (?, ?, ?, ?, ?)`,
            [team_name, lead_user_id, status || 'Available', home_center_id, phone_number]
        );
        res.json({ database: 'SQLite', success: true, id: result.lastID });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// VEHICLES
// ============================================================

router.get('/vehicles', async (req, res) => {
    try {
        const vehicles = await sqlite.all(`
            SELECT v.*, rt.team_name, rc.name as center_name
            FROM vehicles v
            LEFT JOIN rescue_teams rt ON v.assigned_team_id = rt.team_id
            LEFT JOIN resource_centers rc ON v.current_center_id = rc.center_id
            ORDER BY v.vehicle_id
        `);
        res.json({ database: 'SQLite', count: vehicles.length, data: vehicles });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/vehicles', async (req, res) => {
    try {
        const { vehicle_no, type, capacity, current_center_id, assigned_team_id } = req.body;
        const result = await sqlite.run(
            `INSERT INTO vehicles (vehicle_no, type, capacity, current_center_id, assigned_team_id) 
             VALUES (?, ?, ?, ?, ?)`,
            [vehicle_no, type, capacity, current_center_id, assigned_team_id]
        );
        res.json({ database: 'SQLite', success: true, id: result.lastID });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// CITIZEN REQUESTS
// ============================================================

router.get('/requests', async (req, res) => {
    try {
        const requests = await sqlite.all(`
            SELECT cr.*, dz.name as zone_name
            FROM citizen_requests cr
            LEFT JOIN disaster_zones dz ON cr.zone_id = dz.zone_id
            ORDER BY cr.priority DESC
        `);
        res.json({ database: 'SQLite', count: requests.length, data: requests });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/requests', async (req, res) => {
    try {
        const { reporter_name, reporter_phone, description, lat, lng, zone_id, priority, status } = req.body;
        const result = await sqlite.run(
            `INSERT INTO citizen_requests (reporter_name, reporter_phone, description, lat, lng, zone_id, priority, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [reporter_name, reporter_phone, description, lat, lng, zone_id, priority, status || 'Pending']
        );
        res.json({ database: 'SQLite', success: true, id: result.lastID });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// RESOURCES & INVENTORY
// ============================================================

router.get('/resources', async (req, res) => {
    try {
        const resources = await sqlite.all('SELECT * FROM resources ORDER BY resource_id');
        res.json({ database: 'SQLite', count: resources.length, data: resources });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/inventory', async (req, res) => {
    try {
        const inventory = await sqlite.all(`
            SELECT i.*, rc.name as center_name, r.name as resource_name, r.unit
            FROM inventories i
            JOIN resource_centers rc ON i.center_id = rc.center_id
            JOIN resources r ON i.resource_id = r.resource_id
            ORDER BY i.inventory_id
        `);
        res.json({ database: 'SQLite', count: inventory.length, data: inventory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// RESOURCE CENTERS
// ============================================================

router.get('/centers', async (req, res) => {
    try {
        const centers = await sqlite.all('SELECT * FROM resource_centers ORDER BY center_id');
        res.json({ database: 'SQLite', count: centers.length, data: centers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// CUSTOM QUERY EXECUTION (for demo purposes)
// ============================================================

router.post('/query', async (req, res) => {
    const startTime = Date.now();
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // Determine query type
        const queryType = query.trim().toUpperCase().split(' ')[0];
        let result;

        if (queryType === 'SELECT') {
            result = await sqlite.all(query);
            res.json({
                database: 'SQLite',
                success: true,
                executionTime: `${Date.now() - startTime}ms`,
                rowCount: result.length,
                data: result
            });
        } else {
            result = await sqlite.run(query);
            res.json({
                database: 'SQLite',
                success: true,
                executionTime: `${Date.now() - startTime}ms`,
                changes: result.changes,
                lastID: result.lastID
            });
        }
    } catch (error) {
        res.status(400).json({
            database: 'SQLite',
            success: false,
            executionTime: `${Date.now() - startTime}ms`,
            error: error.message
        });
    }
});

module.exports = router;
