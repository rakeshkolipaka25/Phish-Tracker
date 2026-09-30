const express = require('express');
const router = express.Router();
const path = require('path');
const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const ActivityLog = require('../models/ActivityLog');
const inMemoryStore = require('../data/inMemoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

// 1x1 transparent GIF buffer
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

// Helper to log event into separate activitylogs collection in Atlas
async function logSeparateActivity({ campaign, recipient, eventType, req }) {
  if (!isDbConnected() || !recipient) return;
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    await ActivityLog.create({
      campaignId: campaign ? campaign._id : null,
      campaignTitle: campaign ? campaign.title : 'Simulation',
      email: recipient.email,
      fullName: recipient.fullName || 'User',
      trackingToken: recipient.trackingToken,
      eventType: eventType,
      status: recipient.status || 'delivered',
      urlClicked: recipient.clicked || false,
      fileOpened: recipient.attachmentInteracted || false,
      clickCount: recipient.clickCount || 0,
      ipAddress: ip,
      userAgent: userAgent,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Error logging to activitylogs collection:', err.message);
  }
}

// Helper to find and mutate recipient
async function findAndTrackRecipient(token, mutateFn) {
  if (isDbConnected()) {
    try {
      const campaign = await Campaign.findOne({ 'recipients.trackingToken': token }).populate('template');
      if (campaign) {
        const recipient = campaign.recipients.find(r => r.trackingToken === token);
        if (recipient) {
          mutateFn(recipient, campaign);
          await campaign.save();
          return { campaign, recipient };
        }
      }
    } catch (e) {
      console.error('DB track error:', e.message);
    }
  }

  // Fallback to in-memory store
  for (const campaign of inMemoryStore.campaigns) {
    const recipient = campaign.recipients.find(r => r.trackingToken === token);
    if (recipient) {
      mutateFn(recipient, campaign);
      return { campaign, recipient };
    }
  }

  return { campaign: null, recipient: null };
}

// 1. Email Open Web Beacon
router.get('/open', async (req, res) => {
  const { token } = req.query;

  if (token) {
    const tracked = await findAndTrackRecipient(token, (recipient, campaign) => {
      if (!recipient.opened) {
        recipient.opened = true;
        recipient.openedAt = new Date();
        campaign.stats.openedCount = (campaign.stats.openedCount || 0) + 1;
      }
      recipient.openCount = (recipient.openCount || 0) + 1;
      recipient.ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      recipient.userAgent = req.get('User-Agent');
    });

    if (tracked.recipient) {
      await logSeparateActivity({ campaign: tracked.campaign, recipient: tracked.recipient, eventType: 'opened', req });
    }
  }

  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': TRANSPARENT_GIF.length,
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  res.end(TRANSPARENT_GIF);
});

// 2. Link Click Tracking -> Serve Phishing Page
router.get('/click', async (req, res) => {
  const { token } = req.query;

  let tracked = { campaign: null, recipient: null };

  if (token) {
    tracked = await findAndTrackRecipient(token, (recipient, campaign) => {
      if (!recipient.clicked) {
        recipient.clicked = true;
        recipient.clickedAt = new Date();
        campaign.stats.clickedCount = (campaign.stats.clickedCount || 0) + 1;
      }
      recipient.clickCount = (recipient.clickCount || 0) + 1;
      recipient.ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      recipient.userAgent = req.get('User-Agent');
    });

    if (tracked.recipient) {
      await logSeparateActivity({ campaign: tracked.campaign, recipient: tracked.recipient, eventType: 'link_clicked', req });
    }
  }

  // Serve the Amazon phishing page instead of awareness landing
  res.sendFile(path.join(__dirname, '../../public/amazon/index.html'));
});

// 3. Attachment Simulation Tracking -> Educational landing page
router.get('/attachment', async (req, res) => {
  const { token } = req.query;

  let tracked = { campaign: null, recipient: null };

  if (token) {
    tracked = await findAndTrackRecipient(token, (recipient, campaign) => {
      if (!recipient.attachmentInteracted) {
        recipient.attachmentInteracted = true;
        recipient.attachmentInteractedAt = new Date();
        campaign.stats.attachmentInteractedCount = (campaign.stats.attachmentInteractedCount || 0) + 1;
      }
      recipient.ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      recipient.userAgent = req.get('User-Agent');
    });

    if (tracked.recipient) {
      await logSeparateActivity({ campaign: tracked.campaign, recipient: tracked.recipient, eventType: 'file_opened', req });
    }
  }

  res.render('awareness-landing', {
    token,
    recipient: tracked.recipient,
    campaign: tracked.campaign,
    type: 'attachment_click'
  });
});

// 4. Awareness Training Completion Confirmation
router.post('/complete-awareness', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token is required' });

  const tracked = await findAndTrackRecipient(token, (recipient, campaign) => {
    if (!recipient.awarenessCompleted) {
      recipient.awarenessCompleted = true;
      recipient.awarenessCompletedAt = new Date();
      campaign.stats.awarenessCompletedCount = (campaign.stats.awarenessCompletedCount || 0) + 1;
    }
  });

  if (tracked.recipient) {
    await logSeparateActivity({ campaign: tracked.campaign, recipient: tracked.recipient, eventType: 'awareness_completed', req });
    return res.json({ success: true, message: 'Awareness training module recorded!' });
  }
  return res.status(404).json({ error: 'Session not found' });
});

module.exports = router;
