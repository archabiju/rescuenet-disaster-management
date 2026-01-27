const mongoose = require('mongoose');

async function listDatabases() {
    try {
        const uri = 'mongodb://localhost:27017';
        const conn = await mongoose.createConnection(uri).asPromise();
        console.log('Connected to MongoDB');

        const admin = conn.db.admin();
        const result = await admin.listDatabases();

        console.log('\nDatabases found:');
        for (const db of result.databases) {
            console.log(`- ${db.name} (${db.sizeOnDisk} bytes)`);
        }

        await conn.close();
    } catch (err) {
        console.error(err);
    }
}

listDatabases();
