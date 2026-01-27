/**
 * SQLite Configuration for RescueNet
 * Simple file-based database - no password needed!
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file path
const DB_PATH = path.join(__dirname, '../database/rescuenet.db');

let db = null;

/**
 * Get database connection
 */
const getDatabase = () => {
    if (!db) {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('❌ SQLite connection error:', err);
            } else {
                console.log('✅ Connected to SQLite database:', DB_PATH);
            }
        });
        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON');
    }
    return db;
};

/**
 * Run a query (INSERT, UPDATE, DELETE)
 */
const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        getDatabase().run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

/**
 * Get all rows from a query
 */
const all = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        getDatabase().all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

/**
 * Get single row from a query
 */
const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        getDatabase().get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

/**
 * Execute multiple SQL statements (for initialization)
 */
const exec = (sql) => {
    return new Promise((resolve, reject) => {
        getDatabase().exec(sql, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

/**
 * Initialize database with schema and sample data
 */
const initializeDatabase = async () => {
    try {
        // Read and execute schema (disaster.sql)
        const schemaPath = path.join(__dirname, 'disaster.sql');
        if (fs.existsSync(schemaPath)) {
            console.log('📋 Loading schema from disaster.sql...');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            // Remove the SELECT statement at the end
            const cleanSchema = schema.replace(/SELECT name FROM sqlite_master WHERE type='table';/g, '');
            await exec(cleanSchema);
            console.log('✅ Schema created successfully');
        } else {
            console.log('⚠️ disaster.sql not found at:', schemaPath);
        }

        // Read and execute insert data (insert.sql)
        const insertPath = path.join(__dirname, 'insert.sql');
        if (fs.existsSync(insertPath)) {
            console.log('📋 Loading sample data from insert.sql...');
            const insertData = fs.readFileSync(insertPath, 'utf8');
            // Remove COMMIT statement if exists
            const cleanInsert = insertData.replace(/COMMIT;/g, '');
            await exec(cleanInsert);
            console.log('✅ Sample data inserted successfully');
        } else {
            console.log('⚠️ insert.sql not found at:', insertPath);
        }

        return { success: true, message: 'Database initialized' };
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Close database connection
 */
const closeDatabase = () => {
    if (db) {
        db.close((err) => {
            if (err) console.error('Error closing database:', err);
            else console.log('Database connection closed');
        });
        db = null;
    }
};

/**
 * Test database connection
 */
const testConnection = async () => {
    try {
        const result = await all("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('📊 Available tables:', result.map(r => r.name).join(', '));
        return { connected: true, tables: result.length };
    } catch (error) {
        console.error('❌ Connection test failed:', error);
        return { connected: false, error: error.message };
    }
};

module.exports = {
    getDatabase,
    run,
    all,
    get,
    exec,
    initializeDatabase,
    closeDatabase,
    testConnection
};
