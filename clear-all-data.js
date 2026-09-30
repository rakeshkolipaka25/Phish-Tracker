const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = 'mongodb+srv://Rakeshkolipaka:R%40kesh630@cluster0.e1idkwr.mongodb.net/phishaware?retryWrites=true&w=majority&appName=Cluster0';

async function clearAllData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Found collections:', collections.map(c => c.name));

    console.log('\n⚠️  WARNING: This will delete ALL data from the following collections:');
    collections.forEach(c => {
      console.log(`   - ${c.name}`);
    });

    console.log('\n🗑️  Deleting all data...');

    // Delete all documents from each collection
    for (const collection of collections) {
      const result = await db.collection(collection.name).deleteMany({});
      console.log(`   ✓ Deleted ${result.deletedCount} documents from '${collection.name}'`);
    }

    console.log('\n✅ All data cleared successfully!');
    console.log('\n📊 Collections are now empty and ready for fresh data.');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearAllData();
