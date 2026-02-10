/**
 * MySQL Routes for RescueNet
 * API endpoints for MySQL database operations
 */
const express = require('express');
const router = express.Router();
const mysql = require('../../config/mysql');

// ============================================================
// USERS
// ============================================================

/**
 * GET /api/mysql/users - Get all users
 */
router.get('/users', async (req, res) => {
    try {
        const users = await mysql.query('SELECT * FROM users ORDER BY user_id');
        res.json({
            database: 'MySQL',
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/mysql/users - Create new user
 */
router.post('/users', async (req, res) => {
    try {
        const { full_name, email, role } = req.body;
        const result = await mysql.query(
            'INSERT INTO users (full_name, email, role) VALUES (?, ?, ?)',
            [full_name, email, role || 'citizen']
        );
        res.json({
            database: 'MySQL',
            message: 'User created',
            insertId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// DISASTER ZONES
// ============================================================

/**
 * GET /api/mysql/zones - Get all disaster zones
 */
router.get('/zones', async (req, res) => {
    try {
        const zones = await mysql.query('SELECT * FROM disaster_zones ORDER BY zone_id');
        res.json({
            database: 'MySQL',
            count: zones.length,
            data: zones
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/mysql/zones - Create new disaster zone
 */
router.post('/zones', async (req, res) => {
    try {
        const { zone_name, severity, status } = req.body;
        const result = await mysql.query(
            'INSERT INTO disaster_zones (name, severity, status) VALUES (?, ?, ?)',
            [zone_name, severity || 'Medium', status || 'Active']
        );
        res.json({
            database: 'MySQL',
            message: 'Zone created',
            insertId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// SHELTERS
// ============================================================

/**
 * GET /api/mysql/shelters - Get all shelters with zone info
 */
router.get('/shelters', async (req, res) => {
    try {
        const shelters = await mysql.query(`
            SELECT s.*, dz.name AS zone_name, dz.severity 
            FROM shelters s
            LEFT JOIN disaster_zones dz ON s.zone_id = dz.zone_id
            ORDER BY s.shelter_id
        `);
        res.json({
            database: 'MySQL',
            count: shelters.length,
            data: shelters
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/mysql/shelters - Create new shelter
 */
router.post('/shelters', async (req, res) => {
    try {
        const { shelter_name, capacity, current_occupancy, zone_id } = req.body;
        const result = await mysql.query(
            'INSERT INTO shelters (name, capacity, current_occupancy, zone_id) VALUES (?, ?, ?, ?)',
            [shelter_name, capacity || 100, current_occupancy || 0, zone_id]
        );
        res.json({
            database: 'MySQL',
            message: 'Shelter created',
            insertId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// RESCUE TEAMS
// ============================================================

/**
 * GET /api/mysql/teams - Get all rescue teams
 */
router.get('/teams', async (req, res) => {
    try {
        const teams = await mysql.query(`
            SELECT rt.*, dz.name AS zone_name 
            FROM rescue_teams rt
            LEFT JOIN disaster_zones dz ON rt.zone_id = dz.zone_id
            ORDER BY rt.team_id
        `);
        res.json({
            database: 'MySQL',
            count: teams.length,
            data: teams
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// CITIZEN REQUESTS
// ============================================================

/**
 * GET /api/mysql/requests - Get all citizen requests
 */
router.get('/requests', async (req, res) => {
    try {
        const requests = await mysql.query(`
            SELECT cr.*, dz.name AS zone_name, dz.severity 
            FROM citizen_requests cr
            LEFT JOIN disaster_zones dz ON cr.zone_id = dz.zone_id
            ORDER BY cr.priority DESC, cr.created_at DESC
        `);
        res.json({
            database: 'MySQL',
            count: requests.length,
            data: requests
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/mysql/requests - Create new request
 */
router.post('/requests', async (req, res) => {
    try {
        const { reporter_name, description, priority, status, zone_id } = req.body;
        const result = await mysql.query(
            'INSERT INTO citizen_requests (reporter_name, description, priority, status, zone_id) VALUES (?, ?, ?, ?, ?)',
            [reporter_name, description, priority || 1, status || 'Pending', zone_id]
        );
        res.json({
            database: 'MySQL',
            message: 'Request created',
            insertId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/mysql/requests/:id - Update request status
 */
router.put('/requests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, priority } = req.body;
        await mysql.query(
            'UPDATE citizen_requests SET status = ?, priority = ? WHERE request_id = ?',
            [status, priority, id]
        );
        res.json({
            database: 'MySQL',
            message: 'Request updated'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// CUSTOM QUERY (For Demo)
// ============================================================

/**
 * POST /api/mysql/query - Execute custom SQL query
 */
router.post('/query', async (req, res) => {
    try {
        const { sql } = req.body;
        const startTime = Date.now();
        const result = await mysql.query(sql);
        const executionTime = Date.now() - startTime;

        res.json({
            database: 'MySQL',
            executionTime: `${executionTime}ms`,
            rowCount: Array.isArray(result) ? result.length : 0,
            rows: result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// DASHBOARD STATS
// ============================================================

/**
 * GET /api/mysql/dashboard - Get dashboard statistics
 */
router.get('/dashboard', async (req, res) => {
    try {
        const [users] = await mysql.query('SELECT COUNT(*) as count FROM users');
        const [zones] = await mysql.query('SELECT COUNT(*) as count FROM disaster_zones WHERE status = "Active"');
        const [shelters] = await mysql.query('SELECT SUM(capacity - current_occupancy) as available FROM shelters');
        const [requests] = await mysql.query('SELECT COUNT(*) as count FROM citizen_requests WHERE status = "Pending"');

        res.json({
            database: 'MySQL',
            stats: {
                totalUsers: users.count,
                activeZones: zones.count,
                availableShelterSpace: shelters.available || 0,
                pendingRequests: requests.count
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// DISASTER REPORTS (For Report Disaster form)
// ============================================================

/**
 * GET /api/mysql/disaster-reports - Get all disaster reports
 */
router.get('/disaster-reports', async (req, res) => {
    try {
        const reports = await mysql.query(`
            SELECT dr.*, dz.name AS zone_name, dz.severity AS zone_severity 
            FROM disaster_reports dr
            LEFT JOIN disaster_zones dz ON dr.zone_id = dz.zone_id
            ORDER BY dr.created_at DESC
        `);
        res.json({
            database: 'MySQL',
            count: reports.length,
            data: reports
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/mysql/disaster-reports - Create new disaster report
 */
router.post('/disaster-reports', async (req, res) => {
    try {
        const {
            reporter_name,
            reporter_phone,
            location_lat,
            location_lng,
            disaster_type,
            description,
            severity_estimate,
            zone_id
        } = req.body;

        const result = await mysql.query(
            `INSERT INTO disaster_reports 
            (reporter_name, reporter_phone, location_lat, location_lng, disaster_type, description, severity_estimate, zone_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [reporter_name, reporter_phone, location_lat, location_lng, disaster_type, description, severity_estimate, zone_id || null]
        );

        res.json({
            database: 'MySQL',
            message: 'Disaster report created successfully',
            insertId: result.insertId
        });
    } catch (error) {
        console.error('Error creating disaster report:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/mysql/disaster-reports/:id - Update report status
 */
router.put('/disaster-reports/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await mysql.query(
            'UPDATE disaster_reports SET status = ? WHERE report_id = ?',
            [status, id]
        );
        res.json({
            database: 'MySQL',
            message: 'Report updated'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// RESOURCE REQUESTS (For Request Resources form)
// ============================================================

/**
 * GET /api/mysql/resource-requests - Get all resource requests
 */
router.get('/resource-requests', async (req, res) => {
    try {
        const requests = await mysql.query(`
            SELECT * FROM resource_requests
            ORDER BY created_at DESC
        `);
        res.json({
            database: 'MySQL',
            count: requests.length,
            data: requests
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/mysql/resource-requests - Create new resource request
 */
router.post('/resource-requests', async (req, res) => {
    try {
        const {
            requester_name,
            requester_phone,
            requester_id,
            resource_type,
            quantity,
            urgency,
            location,
            description
        } = req.body;

        const result = await mysql.query(
            `INSERT INTO resource_requests 
            (requester_name, requester_phone, requester_id, resource_type, quantity, urgency, location, description) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [requester_name, requester_phone, requester_id || null, resource_type, quantity || 1, urgency || 'medium', location, description]
        );

        res.json({
            database: 'MySQL',
            message: 'Resource request created successfully',
            insertId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/mysql/resource-requests/:id - Update request status
 */
router.put('/resource-requests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await mysql.query(
            'UPDATE resource_requests SET status = ? WHERE request_id = ?',
            [status, id]
        );
        res.json({
            database: 'MySQL',
            message: 'Request updated'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
