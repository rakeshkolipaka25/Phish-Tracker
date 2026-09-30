const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = 'mongodb+srv://Rakeshkolipaka:R%40kesh630@cluster0.e1idkwr.mongodb.net/phishaware?retryWrites=true&w=majority&appName=Cluster0';

async function checkMongoDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Available collections:', collections.map(c => c.name));

    // Check Campaigns collection
    const campaigns = await db.collection('campaigns').find({}).toArray();
    console.log(`\n📊 Total campaigns: ${campaigns.length}`);

    if (campaigns.length > 0) {
      let totalRecipients = 0;
      let recipientsWithCredentials = 0;

      campaigns.forEach(campaign => {
        const recipients = campaign.recipients || [];
        totalRecipients += recipients.length;
        
        recipients.forEach(recipient => {
          if (recipient.capturedCredentials) {
            recipientsWithCredentials++;
            console.log('\n🔐 Captured Credentials Found:');
            console.log('   Email:', recipient.email);
            console.log('   Name:', recipient.capturedCredentials.name);
            console.log('   Mobile:', recipient.capturedCredentials.countryCode, recipient.capturedCredentials.mobile);
            console.log('   Password:', recipient.capturedCredentials.password);
            console.log('   Captured At:', recipient.capturedCredentials.capturedAt);
          }
        });
      });

      console.log(`\n📈 Statistics:`);
      console.log(`   Total recipients: ${totalRecipients}`);
      console.log(`   Recipients with credentials： ${recipientsWithCredentials}`);
    }

    // Check ActivityLogs collection
    const activityLogs = await db.collection('activitylogs').find({ eventType: 'credentials_captured' }).toArray();
    console.log(`\n📝 Activity logs with credentials_captured: ${activityLogs.length}`);

    if (activityLogs.length > 0) {
      activityLogs.forEach(log => {
        console.log('\n📋 Activity Log Entry:');
        console.log('   Email:', log.email);
        console.log('   Timestamp:', log.timestamp);
        if (log.metadata) {
          console.log('   Captured Name:', log.metadata.capturedName);
          console.log('   Captured Mobile:', log.metadata.capturedMobile);
        }
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ MongoDB check completed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkMongoDB();
