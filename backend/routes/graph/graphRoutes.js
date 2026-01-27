/**
 * Neo4j Graph Routes for RescueNet
 * Demonstrates graph queries and relationship analysis
 */
const express = require('express');
const router = express.Router();
const neo4j = require('../../config/neo4j');

// ============================================================
// COLLABORATION ANALYSIS
// ============================================================

/**
 * GET /api/graph/team-collaboration - Get team coordination network
 */
router.get('/team-collaboration', async (req, res) => {
    try {
        const records = await neo4j.runQuery(`
      MATCH (t1:Team)-[r:COORDINATES_WITH]->(t2:Team)
      RETURN t1.name AS team1, t2.name AS team2, r.reason AS reason
    `);

        const data = records.map(record => ({
            team1: record.get('team1'),
            team2: record.get('team2'),
            reason: record.get('reason')
        }));

        res.json({
            database: 'Neo4j',
            query: 'Team Collaboration Network',
            count: data.length,
            data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/graph/user-network - Get user relationships
 */
router.get('/user-network', async (req, res) => {
    try {
        const records = await neo4j.runQuery(`
      MATCH (u:User)
      OPTIONAL MATCH (u)-[:LEADS]->(teamLed:Team)
      OPTIONAL MATCH (u)-[:MEMBER_OF]->(teamMember:Team)
      OPTIONAL MATCH (u)-[:SUPERVISES]->(zone:Zone)
      RETURN u.name AS name, u.role AS role,
             COLLECT(DISTINCT teamLed.name) AS teamsLed,
             COLLECT(DISTINCT teamMember.name) AS teamMemberships,
             COLLECT(DISTINCT zone.name) AS zonesSupervised
    `);

        const data = records.map(record => ({
            name: record.get('name'),
            role: record.get('role'),
            teamsLed: record.get('teamsLed'),
            teamMemberships: record.get('teamMemberships'),
            zonesSupervised: record.get('zonesSupervised')
        }));

        res.json({
            database: 'Neo4j',
            query: 'User Network Analysis',
            count: data.length,
            data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// RESOURCE FLOW ANALYSIS
// ============================================================

/**
 * GET /api/graph/resource-flow - Track resource distribution
 */
router.get('/resource-flow', async (req, res) => {
    try {
        const records = await neo4j.runQuery(`
      MATCH (rc:ResourceCenter)-[sup:SUPPLIES]->(z:Zone)
      RETURN rc.name AS centerName, z.name AS zoneName, 
             z.severity AS severity, sup.resources AS resources
      ORDER BY z.severity DESC
    `);

        const data = records.map(record => ({
            centerName: record.get('centerName'),
            zoneName: record.get('zoneName'),
            severity: record.get('severity')?.toNumber ? record.get('severity').toNumber() : record.get('severity'),
            resources: record.get('resources')
        }));

        res.json({
            database: 'Neo4j',
            query: 'Resource Flow from Centers to Zones',
            count: data.length,
            data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ZONE ANALYSIS
// ============================================================

/**
 * GET /api/graph/zone-overview - Get zone with all relationships
 */
router.get('/zone-overview', async (req, res) => {
    try {
        const records = await neo4j.runQuery(`
      MATCH (z:Zone)
      OPTIONAL MATCH (t:Team)-[:ASSIGNED_TO]->(z)
      OPTIONAL MATCH (s:Shelter)-[:LOCATED_IN]->(z)
      OPTIONAL MATCH (rc:ResourceCenter)-[:SUPPLIES]->(z)
      OPTIONAL MATCH (u:User)-[:SUPERVISES]->(z)
      RETURN z.name AS zone, z.severity AS severity, z.status AS status,
             COLLECT(DISTINCT t.name) AS assignedTeams,
             COLLECT(DISTINCT s.name) AS shelters,
             COLLECT(DISTINCT rc.name) AS suppliers,
             COLLECT(DISTINCT u.name) AS supervisors
    `);

        const data = records.map(record => ({
            zone: record.get('zone'),
            severity: record.get('severity')?.toNumber ? record.get('severity').toNumber() : record.get('severity'),
            status: record.get('status'),
            assignedTeams: record.get('assignedTeams'),
            shelters: record.get('shelters'),
            suppliers: record.get('suppliers'),
            supervisors: record.get('supervisors')
        }));

        res.json({
            database: 'Neo4j',
            query: 'Zone Overview with All Relationships',
            count: data.length,
            data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/graph/critical-zones - Find undersupported zones
 */
router.get('/critical-zones', async (req, res) => {
    try {
        const records = await neo4j.runQuery(`
      MATCH (z:Zone {severity: 5})
      OPTIONAL MATCH (t:Team)-[:ASSIGNED_TO]->(z)
      WITH z, COUNT(t) AS teamCount
      WHERE teamCount < 2
      RETURN z.name AS zone, z.disasterType AS type, teamCount
    `);

        const data = records.map(record => ({
            zone: record.get('zone'),
            type: record.get('type'),
            teamCount: record.get('teamCount')?.toNumber ? record.get('teamCount').toNumber() : record.get('teamCount')
        }));

        res.json({
            database: 'Neo4j',
            query: 'Critical Zones Needing More Teams',
            count: data.length,
            data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// PATH FINDING
// ============================================================

/**
 * GET /api/graph/shortest-path - Find path between entities
 */
router.get('/shortest-path', async (req, res) => {
    try {
        const { from, to } = req.query;

        const records = await neo4j.runQuery(`
      MATCH (start {name: $from}), (end {name: $to})
      MATCH path = shortestPath((start)-[*..5]-(end))
      RETURN [n IN nodes(path) | n.name] AS pathNodes,
             [r IN relationships(path) | type(r)] AS pathRelations,
             length(path) AS pathLength
    `, { from: from || 'Alpha Team', to: to || 'Kerala Landslide Area' });

        const data = records.map(record => ({
            nodes: record.get('pathNodes'),
            relations: record.get('pathRelations'),
            length: record.get('pathLength')?.toNumber ? record.get('pathLength').toNumber() : record.get('pathLength')
        }));

        res.json({
            database: 'Neo4j',
            query: 'Shortest Path Between Entities',
            from: from || 'Alpha Team',
            to: to || 'Kerala Landslide Area',
            data: data[0] || null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// HUB ANALYSIS
// ============================================================

/**
 * GET /api/graph/most-connected - Find most connected nodes
 */
router.get('/most-connected', async (req, res) => {
    try {
        const records = await neo4j.runQuery(`
      MATCH (n)
      WHERE n:User OR n:Team OR n:Zone
      OPTIONAL MATCH (n)-[r]-()
      WITH n, COUNT(r) AS connections, labels(n)[0] AS nodeType
      ORDER BY connections DESC
      LIMIT 10
      RETURN nodeType, n.name AS name, connections
    `);

        const data = records.map(record => ({
            type: record.get('nodeType'),
            name: record.get('name'),
            connections: record.get('connections')?.toNumber ? record.get('connections').toNumber() : record.get('connections')
        }));

        res.json({
            database: 'Neo4j',
            query: 'Most Connected Entities (Hub Analysis)',
            count: data.length,
            data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// GRAPH INITIALIZATION
// ============================================================

/**
 * POST /api/graph/init - Initialize Neo4j with schema
 */
router.post('/init', async (req, res) => {
    try {
        await neo4j.initializeGraph();
        res.json({
            database: 'Neo4j',
            message: 'Graph schema initialized (constraints, indexes)'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/graph/seed - Seed Neo4j with sample data
 */
router.post('/seed', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const seedPath = path.join(__dirname, '../../database/neo4j/graph_seed.cypher');

        if (fs.existsSync(seedPath)) {
            const seedCypher = fs.readFileSync(seedPath, 'utf8');
            // Split by semicolon and execute each statement
            const statements = seedCypher.split(';').filter(s => s.trim());

            for (const statement of statements) {
                if (statement.trim()) {
                    await neo4j.runQuery(statement);
                }
            }

            res.json({
                database: 'Neo4j',
                message: 'Graph seeded with sample nodes and relationships'
            });
        } else {
            res.status(404).json({ error: 'Seed file not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/graph/clear - Clear all graph data (use with caution!)
 */
router.delete('/clear', async (req, res) => {
    try {
        await neo4j.runQuery('MATCH (n) DETACH DELETE n');
        res.json({
            database: 'Neo4j',
            message: 'All graph data cleared'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
