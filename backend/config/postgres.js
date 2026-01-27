const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool
const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'rescuenet',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => {
    console.log('✓ PostgreSQL pool connection established');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL pool error:', err.message);
});

/**
 * Execute a query with parameters
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log(`[PostgreSQL] Query executed in ${duration}ms, rows: ${result.rowCount}`);
        return result;
    } catch (error) {
        console.error('[PostgreSQL] Query error:', error.message);
        throw error;
    }
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise} PostgreSQL client
 */
const getClient = async () => {
    const client = await pool.connect();
    const originalQuery = client.query.bind(client);
    const originalRelease = client.release.bind(client);

    // Override query to log
    client.query = async (...args) => {
        const start = Date.now();
        const result = await originalQuery(...args);
        const duration = Date.now() - start;
        console.log(`[PostgreSQL Transaction] Query executed in ${duration}ms`);
        return result;
    };

    // Override release to log
    client.release = () => {
        console.log('[PostgreSQL] Client released back to pool');
        return originalRelease();
    };

    return client;
};

/**
 * Test PostgreSQL connection
 * @returns {Promise<boolean>} Connection status
 */
const testConnection = async () => {
    try {
        const result = await query('SELECT NOW() as current_time, version() as pg_version');
        console.log('✓ PostgreSQL connected:', result.rows[0].current_time);
        return true;
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error.message);
        return false;
    }
};

/**
 * Initialize PostgreSQL database (create tables if not exist)
 * @returns {Promise<void>}
 */
const initializeDatabase = async () => {
    const fs = require('fs');
    const path = require('path');

    try {
        // Read and execute schema file
        const schemaPath = path.join(__dirname, '../database/postgresql/schema.sql');
        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            await query(schema);
            console.log('✓ PostgreSQL schema initialized');
        }

        // Read and execute stored procedures
        const proceduresPath = path.join(__dirname, '../database/postgresql/stored_procedures.sql');
        if (fs.existsSync(proceduresPath)) {
            const procedures = fs.readFileSync(proceduresPath, 'utf8');
            await query(procedures);
            console.log('✓ PostgreSQL stored procedures created');
        }

        // Read and execute triggers
        const triggersPath = path.join(__dirname, '../database/postgresql/triggers.sql');
        if (fs.existsSync(triggersPath)) {
            const triggers = fs.readFileSync(triggersPath, 'utf8');
            await query(triggers);
            console.log('✓ PostgreSQL triggers created');
        }

    } catch (error) {
        console.error('❌ Error initializing PostgreSQL:', error.message);
    }
};

/**
 * Close the pool
 * @returns {Promise<void>}
 */
const closePool = async () => {
    await pool.end();
    console.log('PostgreSQL pool closed');
};

module.exports = {
    pool,
    query,
    getClient,
    testConnection,
    initializeDatabase,
    closePool
};
