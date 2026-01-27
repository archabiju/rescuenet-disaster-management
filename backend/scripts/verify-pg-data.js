const { query, closePool } = require('../config/postgres');

const verifyData = async () => {
    try {
        console.log('🔍 Verifying PostgreSQL Data...');

        // Check Users
        const users = await query('SELECT count(*) FROM users');
        console.log(`✓ Users found: ${users.rows[0].count}`);

        // Check Disaster Zones
        const zones = await query('SELECT count(*) FROM disaster_zones');
        console.log(`✓ Disaster Zones found: ${zones.rows[0].count}`);

        // Check Resources
        const resources = await query('SELECT count(*) FROM resources');
        console.log(`✓ Resources found: ${resources.rows[0].count}`);

        if (parseInt(users.rows[0].count) > 0 && parseInt(zones.rows[0].count) > 0) {
            console.log('✅ Verification SUCCEEDED: Data exists.');
        } else {
            console.error('❌ Verification FAILED: Tables appear empty.');
        }

    } catch (error) {
        console.error('❌ Verification Error:', error.message);
    } finally {
        await closePool();
    }
};

verifyData();
