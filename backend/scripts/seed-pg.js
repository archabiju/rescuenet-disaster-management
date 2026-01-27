const fs = require('fs');
const path = require('path');
const { query, closePool } = require('../config/postgres');

const seedPostgres = async () => {
    try {
        console.log('🌱 Starting PostgreSQL Seeding...');

        const seedPath = path.join(__dirname, '../database/postgresql/seed.sql');

        if (!fs.existsSync(seedPath)) {
            console.error('❌ seed.sql not found at:', seedPath);
            process.exit(1);
        }

        const seedSql = fs.readFileSync(seedPath, 'utf8');

        // Split commands maybe? Or just run the whole thing. 
        // Usually pg driver handles multiple statements if they are separated by semi-colons, 
        // but sometimes it's safer to not rely on that if the file is huge.
        // However, seed.sql usually contains INSERT statements.
        // Let's try running it as one block first.

        await query(seedSql);

        console.log('✓ PostgreSQL seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding PostgreSQL:', error.message);
        process.exit(1);
    } finally {
        await closePool();
    }
};

seedPostgres();
