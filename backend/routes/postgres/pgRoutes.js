/**
 * PostgreSQL Routes for RescueNet
 * Demonstrates PL/SQL stored procedures and transactional queries
 */
const express = require('express');
const router = express.Router();
const postgres = require('../../config/postgres');

// ============================================================
// BASIC CRUD OPERATIONS
// ============================================================

/**
 * GET /api/pg/users - Get all users from PostgreSQL
 */
router.get('/users', async (req, res) => {
    try {
        const result = await postgres.query(
            'SELECT user_id, full_name, email, phone, role, created_at FROM users ORDER BY user_id'
        );
        res.json({
            database: 'PostgreSQL',
            count: result.rowCount,
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/pg/zones - Get all disaster zones from PostgreSQL
 */
router.get('/zones', async (req, res) => {
    try {
        const result = await postgres.query(
            'SELECT * FROM disaster_zones ORDER BY severity DESC'
        );
        res.json({
            database: 'PostgreSQL',
            count: result.rowCount,
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/pg/shelters - Get all shelters with zone info
 */
router.get('/shelters', async (req, res) => {
    try {
        const result = await postgres.query(`
      SELECT s.*, dz.name as zone_name, dz.severity
      FROM shelters s
      LEFT JOIN disaster_zones dz ON s.zone_id = dz.zone_id
      ORDER BY s.shelter_id
    `);
        res.json({
            database: 'PostgreSQL',
            count: result.rowCount,
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// PL/SQL STORED PROCEDURES DEMOS
// ============================================================

/**
 * POST /api/pg/assign-team - Call assign_team_to_request procedure
 * Body: { requestId, teamId, assignedBy }
 */
router.post('/assign-team', async (req, res) => {
    try {
        const { requestId, teamId, assignedBy } = req.body;

        const result = await postgres.query(
            'SELECT * FROM assign_team_to_request($1, $2, $3)',
            [requestId, teamId, assignedBy]
        );

        const response = result.rows[0];
        if (response.success) {
            res.json({
                database: 'PostgreSQL',
                procedure: 'assign_team_to_request',
                success: true,
                message: response.message,
                assignmentId: response.assignment_id
            });
        } else {
            res.status(400).json({
                database: 'PostgreSQL',
                procedure: 'assign_team_to_request',
                success: false,
                message: response.message
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/pg/allocate-resources - Call allocate_resources procedure
 * Body: { centerId, zoneId, resourceId, quantity, allocatedBy }
 */
router.post('/allocate-resources', async (req, res) => {
    try {
        const { centerId, zoneId, resourceId, quantity, allocatedBy } = req.body;

        const result = await postgres.query(
            'SELECT * FROM allocate_resources($1, $2, $3, $4, $5)',
            [centerId, zoneId, resourceId, quantity, allocatedBy]
        );

        const response = result.rows[0];
        res.json({
            database: 'PostgreSQL',
            procedure: 'allocate_resources',
            success: response.success,
            message: response.message,
            remainingQuantity: response.remaining_quantity
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/pg/zone-capacity/:zoneId - Call get_available_capacity function
 */
router.get('/zone-capacity/:zoneId', async (req, res) => {
    try {
        const { zoneId } = req.params;

        const result = await postgres.query(
            'SELECT * FROM get_available_capacity($1)',
            [zoneId]
        );

        res.json({
            database: 'PostgreSQL',
            function: 'get_available_capacity',
            zoneId: parseInt(zoneId),
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/pg/zone-stats/:zoneId - Call get_zone_statistics function
 */
router.get('/zone-stats/:zoneId', async (req, res) => {
    try {
        const { zoneId } = req.params;

        const result = await postgres.query(
            'SELECT * FROM get_zone_statistics($1)',
            [zoneId]
        );

        res.json({
            database: 'PostgreSQL',
            function: 'get_zone_statistics',
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/pg/team-workload - Call get_team_workload function
 */
router.get('/team-workload', async (req, res) => {
    try {
        const result = await postgres.query('SELECT * FROM get_team_workload()');

        res.json({
            database: 'PostgreSQL',
            function: 'get_team_workload',
            count: result.rowCount,
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/pg/resolve-request - Call resolve_request procedure
 * Body: { requestId, notes }
 */
router.post('/resolve-request', async (req, res) => {
    try {
        const { requestId, notes } = req.body;

        const result = await postgres.query(
            'SELECT * FROM resolve_request($1, $2)',
            [requestId, notes || null]
        );

        res.json({
            database: 'PostgreSQL',
            procedure: 'resolve_request',
            success: result.rows[0].success,
            message: result.rows[0].message
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// COMPLEX SQL QUERIES DEMOS
// ============================================================

/**
 * GET /api/pg/inventory-status - Get inventory with critical alerts
 */
router.get('/inventory-status', async (req, res) => {
    try {
        const result = await postgres.query(`
      SELECT 
        rc.name AS center_name,
        r.name AS resource_name,
        i.quantity,
        r.critical_threshold,
        CASE 
          WHEN i.quantity <= r.critical_threshold THEN 'CRITICAL'
          WHEN i.quantity <= r.critical_threshold * 2 THEN 'LOW'
          ELSE 'OK'
        END AS status
      FROM inventories i
      JOIN resource_centers rc ON i.center_id = rc.center_id
      JOIN resources r ON i.resource_id = r.resource_id
      ORDER BY 
        CASE 
          WHEN i.quantity <= r.critical_threshold THEN 1
          WHEN i.quantity <= r.critical_threshold * 2 THEN 2
          ELSE 3
        END,
        rc.name
    `);

        res.json({
            database: 'PostgreSQL',
            query: 'Inventory Status with Critical Alerts',
            count: result.rowCount,
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/pg/request-summary - Aggregate request statistics
 */
router.get('/request-summary', async (req, res) => {
    try {
        const result = await postgres.query(`
      SELECT 
        dz.name AS zone_name,
        dz.severity,
        COUNT(cr.request_id) AS total_requests,
        SUM(CASE WHEN cr.status = 'Pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN cr.status = 'Assigned' THEN 1 ELSE 0 END) AS assigned,
        SUM(CASE WHEN cr.status = 'Resolved' THEN 1 ELSE 0 END) AS resolved,
        ROUND(AVG(cr.priority)::numeric, 2) AS avg_priority
      FROM disaster_zones dz
      LEFT JOIN citizen_requests cr ON dz.zone_id = cr.zone_id
      GROUP BY dz.zone_id, dz.name, dz.severity
      ORDER BY dz.severity DESC
    `);

        res.json({
            database: 'PostgreSQL',
            query: 'Request Summary by Zone',
            count: result.rowCount,
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/pg/audit-log - Get audit log entries
 */
router.get('/audit-log', async (req, res) => {
    try {
        const result = await postgres.query(`
      SELECT * FROM audit_log 
      ORDER BY performed_at DESC 
      LIMIT 50
    `);

        res.json({
            database: 'PostgreSQL',
            table: 'audit_log (populated by triggers)',
            count: result.rowCount,
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// DATABASE INITIALIZATION
// ============================================================

/**
 * POST /api/pg/init - Initialize PostgreSQL database
 */
router.post('/init', async (req, res) => {
    try {
        await postgres.initializeDatabase();
        res.json({
            database: 'PostgreSQL',
            message: 'Database initialized successfully (schema, procedures, triggers)'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/pg/seed - Seed PostgreSQL with sample data
 */
router.post('/seed', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const seedPath = path.join(__dirname, '../../database/postgresql/seed.sql');

        if (fs.existsSync(seedPath)) {
            const seedSql = fs.readFileSync(seedPath, 'utf8');
            await postgres.query(seedSql);
            res.json({
                database: 'PostgreSQL',
                message: 'Database seeded with sample data'
            });
        } else {
            res.status(404).json({ error: 'Seed file not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ============================================================
// CUSTOM SQL QUERY EXECUTION (FOR DEMO/LEARNING)
// ============================================================

/**
 * POST /api/pg/execute-query - Execute a custom SQL query
 * Body: { query: "SELECT * FROM users" }
 * WARNING: This is for demo purposes only - not secure for production!
 */
router.post('/execute-query', async (req, res) => {
    const startTime = Date.now();
    try {
        const { query } = req.body;

        if (!query || !query.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Query is required'
            });
        }

        // Execute the query
        const result = await postgres.query(query);
        const executionTime = Date.now() - startTime;

        res.json({
            success: true,
            database: 'PostgreSQL',
            query: query,
            executionTime: `${executionTime}ms`,
            rowCount: result.rowCount,
            columns: result.fields ? result.fields.map(f => f.name) : [],
            rows: result.rows,
            command: result.command // INSERT, SELECT, UPDATE, DELETE, etc.
        });
    } catch (error) {
        const executionTime = Date.now() - startTime;
        res.status(400).json({
            success: false,
            database: 'PostgreSQL',
            executionTime: `${executionTime}ms`,
            error: error.message,
            hint: error.hint || null,
            position: error.position || null
        });
    }
});

/**
 * GET /api/pg/tables - Get list of all tables in the database
 */
router.get('/tables', async (req, res) => {
    try {
        const result = await postgres.query(`
            SELECT table_name, table_type
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        res.json({
            success: true,
            database: 'PostgreSQL',
            count: result.rowCount,
            tables: result.rows
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/pg/table-schema/:tableName - Get schema of a specific table
 */
router.get('/table-schema/:tableName', async (req, res) => {
    try {
        const { tableName } = req.params;

        const result = await postgres.query(`
            SELECT 
                column_name,
                data_type,
                character_maximum_length,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = $1
            ORDER BY ordinal_position
        `, [tableName]);

        res.json({
            success: true,
            database: 'PostgreSQL',
            table: tableName,
            columns: result.rows
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
