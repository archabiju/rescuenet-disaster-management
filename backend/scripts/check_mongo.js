const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function checkCollections() {
    try {
        const uri = 'mongodb://localhost:27017/disaster_management';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\nCollections found:');

        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count} documents`);
        }

        console.log('\nChecking "disasterzones" specifically...');
        const defaultCount = await mongoose.connection.db.collection('disasterzones').countDocuments();
        console.log(`disasterzones count: ${defaultCount}`);

        console.log('Checking "disaster_zones" specifically...');
        const underscoreCount = await mongoose.connection.db.collection('disaster_zones').countDocuments();
        console.log(`disaster_zones count: ${underscoreCount}`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCollections();
