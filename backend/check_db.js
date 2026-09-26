const mongoose = require('mongoose');
require('dotenv').config();

async function checkDb(uri, label) {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`\n--- ${label} ---`);
    console.log('URI:', uri.split('@').pop()); 
    console.log('Collections:', collections.map(c => c.name).join(', '));
    for (let c of collections) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`- ${c.name}: ${count} records`);
    }
    await mongoose.disconnect();
  } catch (e) {
    console.log(`\n--- ${label} ---`);
    console.log('Failed to connect or query:', e.message);
  }
}

async function run() {
  await checkDb('mongodb://localhost:27017/enterprise_kms', 'LOCAL MONGODB');
  
  const atlasUri = process.env.MONGO_URI;
  if (atlasUri) {
    await checkDb(atlasUri, 'ATLAS MONGODB');
  } else {
    console.log('No MONGO_URI in .env');
  }
}
run();
