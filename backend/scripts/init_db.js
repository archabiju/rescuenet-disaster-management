const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
});

async function runSqlFile(filename) {
    const filePath = path.join(__dirname, '../database/postgresql', filename);
    console.log(`Reading ${filename}...`);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`Executing ${filename}...`);
    try {
        await pool.query(sql);
        console.log(`✅ ${filename} executed successfully.`);
    } catch (err) {
        console.error(`❌ Error executing ${filename}:`, err);
        throw err;
    }
}

async function init() {
    try {
        console.log('🔌 Connecting to PostgreSQL...');
        console.log(`DB: ${process.env.POSTGRES_DB}`);

        // 1. Schema (Tables)
        await runSqlFile('schema.sql');

        // 2. Stored Procedures
        await runSqlFile('stored_procedures.sql');

        // 3. Triggers
        await runSqlFile('triggers.sql');

        // 4. Seed Data
        await runSqlFile('seed.sql');

        console.log('🎉 Database initialization complete!');
    } catch (err) {
        console.error('Initialization failed:', err);
    } finally {
        await pool.end();
    }
}

init();
