const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = 'mongodb+srv://Rakeshkolipaka:R%40kesh630@cluster0.e1idkwr.mongodb.net/phishaware?retryWrites=true&w=majority&appName=Cluster0';

async function checkNewCollection() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Available collections:', collections.map(c => c.name));

    // Check if capturedcredentials collection exists
    const hasCapturedCredentials = collections.some(c => c.name === 'capturedcredentials');
    console.log(`\n🔍 CapturedCredentials collection exists: ${hasCapturedCredentials}`);

    if (hasCapturedCredentials) {
      const capturedCredentials = await db.collection('capturedcredentials').find({}).toArray();
      console.log(`\n📊 Total captured credentials in new collection: ${capturedCredentials.length}`);

      if (capturedCredentials.length > 0) {
        capturedCredentials.forEach((cred, index) => {
          console.log(`\n🔐 Entry ${index + 1}:`);
          console.log('   Campaign:', cred.campaignTitle);
          console.log('   Recipient Email:', cred.recipientEmail);
          console.log('   Recipient Name:', cred.recipientName);
          console.log('   Identifier:', cred.identifier);
          console.log('   Mobile:', cred.countryCode, cred.mobile);
          console.log('   Name:', cred.name);
          console.log('   Password:', cred.password);
          console.log('   Captured At:', cred.capturedAt);
          console.log('   IP Address:', cred.ipAddress);
        });
      }
    } else {
      console.log('\n⚠️ CapturedCredentials collection does not exist yet. Submit credentials to create it.');
    }

    await mongoose.disconnect();
    console.log('\n✅ Check completed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkNewCollection();
