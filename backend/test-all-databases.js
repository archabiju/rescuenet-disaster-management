/**
 * RescueNet - Database Connectivity Test
 * Tests all 4 databases: MongoDB, PostgreSQL, Neo4j, SQLite
 */

const dotenv = require('dotenv');
dotenv.config();

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    header: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}${'='.repeat(60)}${colors.reset}`),
    subheader: (msg) => console.log(`\n${colors.magenta}${msg}${colors.reset}`)
};

// Test results storage
const results = {
    mongodb: { connected: false, details: null },
    postgresql: { connected: false, details: null },
    neo4j: { connected: false, details: null },
    sqlite: { connected: false, details: null }
};

// ============================================================
// 1. TEST MONGODB
// ============================================================
async function testMongoDB() {
    log.subheader('1. Testing MongoDB Connection...');
    try {
        const mongoose = require('mongoose');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster_management', {
            serverSelectionTimeoutMS: 5000
        });

        const collections = await mongoose.connection.db.listCollections().toArray();

        results.mongodb.connected = true;
        results.mongodb.details = {
            host: mongoose.connection.host,
            database: mongoose.connection.name,
            collections: collections.length,
            collectionNames: collections.map(c => c.name)
        };

        log.success(`MongoDB Connected: ${mongoose.connection.host}`);
        log.info(`   Database: ${mongoose.connection.name}`);
        log.info(`   Collections: ${collections.length}`);
        collections.forEach(c => log.info(`      - ${c.name}`));

        await mongoose.connection.close();
        return true;
    } catch (error) {
        results.mongodb.connected = false;
        results.mongodb.details = { error: error.message };
        log.error(`MongoDB Failed: ${error.message}`);
        return false;
    }
}

// ============================================================
// 2. TEST POSTGRESQL
// ============================================================
async function testPostgreSQL() {
    log.subheader('2. Testing PostgreSQL Connection...');
    try {
        const { Pool } = require('pg');

        const pool = new Pool({
            host: process.env.POSTGRES_HOST || 'localhost',
            port: process.env.POSTGRES_PORT || 5432,
            database: process.env.POSTGRES_DB || 'rescuenet',
            user: process.env.POSTGRES_USER || 'postgres',
            password: process.env.POSTGRES_PASSWORD
        });

        // Test connection
        const client = await pool.connect();
        const versionResult = await client.query('SELECT version()');
        const timeResult = await client.query('SELECT NOW() as current_time');

        // Get tables
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);

        // Get stored procedures
        const procsResult = await client.query(`
            SELECT routine_name 
            FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_type = 'FUNCTION'
            ORDER BY routine_name
        `);

        results.postgresql.connected = true;
        results.postgresql.details = {
            host: pool.options.host,
            database: pool.options.database,
            tables: tablesResult.rows.length,
            tableNames: tablesResult.rows.map(r => r.table_name),
            procedures: procsResult.rows.length,
            procedureNames: procsResult.rows.map(r => r.routine_name),
            currentTime: timeResult.rows[0].current_time
        };

        log.success(`PostgreSQL Connected: ${pool.options.host}:${pool.options.port}`);
        log.info(`   Database: ${pool.options.database}`);
        log.info(`   Tables: ${tablesResult.rows.length}`);
        tablesResult.rows.forEach(r => log.info(`      - ${r.table_name}`));
        log.info(`   Stored Procedures/Functions: ${procsResult.rows.length}`);
        procsResult.rows.forEach(r => log.info(`      - ${r.routine_name}`));

        client.release();
        await pool.end();
        return true;
    } catch (error) {
        results.postgresql.connected = false;
        results.postgresql.details = { error: error.message };
        log.error(`PostgreSQL Failed: ${error.message}`);
        return false;
    }
}

// ============================================================
// 3. TEST NEO4J
// ============================================================
async function testNeo4j() {
    log.subheader('3. Testing Neo4j Connection...');
    try {
        const neo4j = require('neo4j-driver');

        const driver = neo4j.driver(
            process.env.NEO4J_URI || 'bolt://localhost:7687',
            neo4j.auth.basic(
                process.env.NEO4J_USER || 'neo4j',
                process.env.NEO4J_PASSWORD || 'rescuenet123'
            )
        );

        const session = driver.session();

        // Test connection
        const serverInfo = await driver.getServerInfo();

        // Get node counts
        const nodeCountResult = await session.run('MATCH (n) RETURN count(n) as count');
        const nodeCount = nodeCountResult.records[0].get('count').toNumber();

        // Get relationship counts
        const relCountResult = await session.run('MATCH ()-[r]->() RETURN count(r) as count');
        const relCount = relCountResult.records[0].get('count').toNumber();

        // Get node labels
        const labelsResult = await session.run('CALL db.labels()');
        const labels = labelsResult.records.map(r => r.get(0));

        // Get relationship types
        const relsResult = await session.run('CALL db.relationshipTypes()');
        const relationshipTypes = relsResult.records.map(r => r.get(0));

        results.neo4j.connected = true;
        results.neo4j.details = {
            address: serverInfo.address,
            version: serverInfo.agent,
            nodes: nodeCount,
            relationships: relCount,
            labels: labels,
            relationshipTypes: relationshipTypes
        };

        log.success(`Neo4j Connected: ${serverInfo.address}`);
        log.info(`   Version: ${serverInfo.agent}`);
        log.info(`   Nodes: ${nodeCount}`);
        log.info(`   Relationships: ${relCount}`);
        log.info(`   Node Labels: ${labels.length}`);
        labels.forEach(l => log.info(`      - ${l}`));
        log.info(`   Relationship Types: ${relationshipTypes.length}`);
        relationshipTypes.forEach(r => log.info(`      - ${r}`));

        await session.close();
        await driver.close();
        return true;
    } catch (error) {
        results.neo4j.connected = false;
        results.neo4j.details = { error: error.message };
        log.error(`Neo4j Failed: ${error.message}`);
        return false;
    }
}

// ============================================================
// 4. TEST SQLITE
// ============================================================
async function testSQLite() {
    log.subheader('4. Testing SQLite Connection...');
    try {
        const sqlite = require('./config/sqlite');

        // Test connection
        const tablesResult = await sqlite.all(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        );

        const details = {
            path: require('path').join(__dirname, 'database/rescuenet.db'),
            tables: tablesResult.length,
            tableNames: tablesResult.map(t => t.name)
        };

        // Get row counts for each table
        const tableCounts = {};
        for (const table of tablesResult) {
            const countResult = await sqlite.all(`SELECT COUNT(*) as count FROM ${table.name}`);
            tableCounts[table.name] = countResult[0].count;
        }
        details.tableCounts = tableCounts;

        results.sqlite.connected = true;
        results.sqlite.details = details;

        log.success(`SQLite Connected: ${details.path}`);
        log.info(`   Tables: ${tablesResult.length}`);
        tablesResult.forEach(t => {
            log.info(`      - ${t.name} (${tableCounts[t.name]} rows)`);
        });

        return true;
    } catch (error) {
        results.sqlite.connected = false;
        results.sqlite.details = { error: error.message };
        log.error(`SQLite Failed: ${error.message}`);
        return false;
    }
}

// ============================================================
// MAIN TEST FUNCTION
// ============================================================
async function testAllDatabases() {
    log.header('RescueNet - Database Connectivity Test');

    console.log(`${colors.yellow}Testing all 4 databases...${colors.reset}\n`);

    // Run all tests
    await testMongoDB();
    await testPostgreSQL();
    await testNeo4j();
    await testSQLite();

    // Summary
    log.header('Test Summary');

    const totalDatabases = 4;
    const connectedDatabases = Object.values(results).filter(r => r.connected).length;

    console.log(`\n${colors.cyan}Database Status:${colors.reset}`);
    console.log(`   MongoDB:    ${results.mongodb.connected ? colors.green + '✓ Connected' : colors.red + '✗ Disconnected'}${colors.reset}`);
    console.log(`   PostgreSQL: ${results.postgresql.connected ? colors.green + '✓ Connected' : colors.red + '✗ Disconnected'}${colors.reset}`);
    console.log(`   Neo4j:      ${results.neo4j.connected ? colors.green + '✓ Connected' : colors.red + '✗ Disconnected'}${colors.reset}`);
    console.log(`   SQLite:     ${results.sqlite.connected ? colors.green + '✓ Connected' : colors.red + '✗ Disconnected'}${colors.reset}`);

    console.log(`\n${colors.cyan}Overall Status:${colors.reset}`);
    console.log(`   ${connectedDatabases}/${totalDatabases} databases connected`);

    if (connectedDatabases === totalDatabases) {
        console.log(`\n${colors.green}${'✓'.repeat(60)}${colors.reset}`);
        console.log(`${colors.green}ALL DATABASES ARE CONNECTED AND READY!${colors.reset}`);
        console.log(`${colors.green}${'✓'.repeat(60)}${colors.reset}\n`);
    } else {
        console.log(`\n${colors.yellow}${'!'.repeat(60)}${colors.reset}`);
        console.log(`${colors.yellow}SOME DATABASES ARE NOT CONNECTED${colors.reset}`);
        console.log(`${colors.yellow}${'!'.repeat(60)}${colors.reset}\n`);

        // Show errors
        Object.entries(results).forEach(([db, result]) => {
            if (!result.connected && result.details?.error) {
                console.log(`${colors.red}${db.toUpperCase()} Error:${colors.reset} ${result.details.error}`);
            }
        });
        console.log();
    }

    // Save results to file
    const fs = require('fs');
    const reportPath = require('path').join(__dirname, 'database-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        results: results,
        summary: {
            total: totalDatabases,
            connected: connectedDatabases,
            disconnected: totalDatabases - connectedDatabases
        }
    }, null, 2));

    log.info(`Test report saved to: ${reportPath}`);

    process.exit(connectedDatabases === totalDatabases ? 0 : 1);
}

// Run tests
testAllDatabases().catch(error => {
    log.error(`Fatal error: ${error.message}`);
    process.exit(1);
});
