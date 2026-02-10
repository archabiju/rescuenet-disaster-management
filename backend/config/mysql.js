/**
 * MySQL Configuration for RescueNet
 * Connects to MySQL database for structured data storage
 */
const mysql = require('mysql2/promise');

let pool = null;

/**
 * Get or create MySQL connection pool
 */
const getPool = () => {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.MYSQL_HOST || 'localhost',
            port: process.env.MYSQL_PORT || 3306,
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || 'root',
            database: process.env.MYSQL_DB || 'rescuenet',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        console.log('✅ MySQL connection pool created');
    }
    return pool;
};

/**
 * Execute a query
 */
const query = async (sql, params = []) => {
    const pool = getPool();
    const [rows] = await pool.execute(sql, params);
    return rows;
};

/**
 * Test connection
 */
const testConnection = async () => {
    try {
        const pool = getPool();
        const [rows] = await pool.execute('SELECT 1 as connected');
        const [tables] = await pool.execute('SHOW TABLES');
        return {
            connected: true,
            tables: tables.map(t => Object.values(t)[0])
        };
    } catch (error) {
        console.error('MySQL connection error:', error.message);
        return { connected: false, error: error.message };
    }
};

/**
 * Close pool
 */
const closePool = async () => {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('MySQL pool closed');
    }
};

module.exports = {
    getPool,
    query,
    testConnection,
    closePool
};
