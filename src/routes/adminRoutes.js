const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const mongoose = require('mongoose');
const os = require('os');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Campaign = require('../models/Campaign');
const Template = require('../models/Template');
const ActivityLog = require('../models/ActivityLog');
const emailService = require('../services/emailService');
const inMemoryStore = require('../data/inMemoryStore');
const defaultTemplates = require('../data/defaultTemplates');

// Setup multer storage for custom file uploads
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to determine accessible network base URL
function getReachableBaseUrl(req) {
  // If explicitly configured in .env and not localhost, use it
  if (process.env.BASE_URL && !process.env.BASE_URL.includes('localhost') && !process.env.BASE_URL.includes('127.0.0.1')) {
    return process.env.BASE_URL;
  }

  // Find local Wi-Fi or Ethernet IP so mobile devices on the same network can click and report tracking
  const interfaces = os.networkInterfaces();
  let lanIp = null;
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.')) {
          lanIp = iface.address;
          break;
        }
      }
    }
    if (lanIp) break;
  }

  const port = process.env.PORT || 3000;
  if (lanIp) {
    return `http://${lanIp}:${port}`;
  }

  return `${req.protocol}://${req.get('host')}`;
}

// Seed fallback store
if (inMemoryStore.templates.length === 0) {
  inMemoryStore.templates = defaultTemplates.map(t => ({
    _id: 'tmpl-' + crypto.randomBytes(4).toString('hex'),
    ...t,
    createdAt: new Date()
  }));
}

// Helper to update campaign stats
function updateStats(campaign) {
  const recipients = campaign.recipients || [];
  campaign.stats = {
    totalRecipients: recipients.length,
    deliveredCount: recipients.filter(r => r.status === 'delivered').length,
    openedCount: recipients.filter(r => r.opened).length,
    clickedCount: recipients.filter(r => r.clicked).length,
    attachmentInteractedCount: recipients.filter(r => r.attachmentInteracted).length,
    awarenessCompletedCount: recipients.filter(r => r.awarenessCompleted).length
  };
}

// 1. Dashboard summary stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    let campaigns = [];
    if (isDbConnected()) {
      campaigns = await Campaign.find();
    } else {
      campaigns = inMemoryStore.campaigns;
    }

    let totalSent = 0;
    let totalDelivered = 0;
    let totalOpened = 0;
    let totalClicked = 0;
    let totalAttachmentInteracted = 0;
    let totalAwarenessCompleted = 0;

    campaigns.forEach(c => {
      totalSent += c.recipients.length;
      totalDelivered += c.recipients.filter(r => r.status === 'delivered').length;
      totalOpened += c.recipients.filter(r => r.opened).length;
      totalClicked += c.recipients.filter(r => r.clicked).length;
      totalAttachmentInteracted += c.recipients.filter(r => r.attachmentInteracted).length;
      totalAwarenessCompleted += c.recipients.filter(r => r.awarenessCompleted).length;
    });

    const openRate = totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : 0;
    const clickRate = totalDelivered > 0 ? ((totalClicked / totalDelivered) * 100).toFixed(1) : 0;
    const vulnerabilityRate = totalDelivered > 0 ? (((totalClicked + totalAttachmentInteracted) / totalDelivered) * 100).toFixed(1) : 0;

    res.json({
      totalCampaigns: campaigns.length,
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalAttachmentInteracted,
      totalAwarenessCompleted,
      rates: {
        openRate: Number(openRate),
        clickRate: Number(clickRate),
        vulnerabilityRate: Number(vulnerabilityRate)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Templates API
router.get('/templates', async (req, res) => {
  try {
    if (isDbConnected()) {
      const templates = await Template.find().sort({ createdAt: -1 });
      return res.json(templates);
    }
    res.json(inMemoryStore.templates);
  } catch (err) {
    res.json(inMemoryStore.templates);
  }
});

// 3. Campaigns API
router.get('/campaigns', async (req, res) => {
  try {
    if (isDbConnected()) {
      const campaigns = await Campaign.find().sort({ createdAt: -1 });
      return res.json(campaigns);
    }
    res.json(inMemoryStore.campaigns);
  } catch (err) {
    res.json(inMemoryStore.campaigns);
  }
});

// 4. Live Activity Logs API
router.get('/activity-logs', async (req, res) => {
  try {
    if (isDbConnected()) {
      const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100);
      return res.json(logs);
    }
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/campaigns/:id', async (req, res) => {
  try {
    if (isDbConnected()) {
      const campaign = await Campaign.findById(req.params.id);
      if (campaign) return res.json(campaign);
    }
    const camp = inMemoryStore.campaigns.find(c => String(c._id) === String(req.params.id));
    if (!camp) return res.status(404).json({ error: 'Campaign not found' });
    res.json(camp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create and Launch Campaign (supports JSON or multipart file upload)
router.post('/campaigns', upload.single('customFile'), async (req, res) => {
  try {
    let { 
      title, 
      description, 
      templateId, 
      recipientsList,
      customSenderName,
      customSenderEmail,
      customSubject,
      customBody,
      customAttachmentName,
      hasAttachment,
      customRedirectUrl,
      linkButtonText
    } = req.body;

    // Handle parsed recipients if stringified
    if (typeof recipientsList === 'string') {
      try {
        recipientsList = JSON.parse(recipientsList);
      } catch (e) {
        recipientsList = recipientsList.split('\n').filter(l => l.trim().length > 0).map(line => {
          const parts = line.split(',').map(p => p.trim());
          return {
            fullName: parts[0] || 'User',
            email: parts[1] || parts[0],
            department: 'Team'
          };
        });
      }
    }

    let template = null;
    if (customSubject && customBody) {
      template = {
        _id: 'custom-' + crypto.randomBytes(4).toString('hex'),
        name: title || 'Custom Phishing Campaign',
        senderName: customSenderName || 'IT Security Team',
        senderEmail: customSenderEmail || 'security@internal-update.org',
        subject: customSubject,
        bodyHtml: customBody,
        hasAttachment: Boolean(hasAttachment === 'true' || hasAttachment === true || req.file || customAttachmentName),
        simulatedAttachmentName: req.file ? req.file.originalname : (customAttachmentName || 'Notice_Document.html'),
        uploadedFile: req.file || null,
        customRedirectUrl: customRedirectUrl || null,
        linkButtonText: linkButtonText || 'Open Link',
        redFlags: [
          'External lookalike sender address',
          'Urgent or unexpected action prompt'
        ],
        createdAt: new Date()
      };
    } else {
      if (isDbConnected()) {
        try {
          template = await Template.findById(templateId);
        } catch (e) {}
      }
      if (!template) {
        template = inMemoryStore.templates.find(t => String(t._id) === String(templateId)) || inMemoryStore.templates[0];
      }
    }

    if (!template) return res.status(400).json({ error: 'Please choose a scenario or compose custom email content.' });

    const recipients = (recipientsList || []).map(r => ({
      email: (r.email || '').trim().toLowerCase(),
      fullName: (r.fullName || '').trim() || (r.email || '').split('@')[0],
      department: (r.department || 'General').trim(),
      trackingToken: uuidv4(),
      status: 'pending',
      openCount: 0,
      clickCount: 0,
      opened: false,
      clicked: false,
      attachmentInteracted: false,
      awarenessCompleted: false
    })).filter(r => r.email.includes('@'));

    if (recipients.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one valid recipient email.' });
    }

    const baseUrl = getReachableBaseUrl(req);

    for (const recipient of recipients) {
      const result = await emailService.sendSimulatedEmail({
        template,
        recipient,
        baseUrl
      });
      if (result.success) {
        recipient.status = 'delivered';
        recipient.deliveredAt = new Date();
        if (result.previewUrl) {
          recipient.previewUrl = result.previewUrl;
        }
      } else {
        recipient.status = 'failed';
      }
    }

    const campaignData = {
      _id: isDbConnected() ? new mongoose.Types.ObjectId() : 'camp-' + crypto.randomBytes(4).toString('hex'),
      title: title || customSubject,
      description,
      template: isDbConnected() ? template._id : template,
      status: 'active',
      recipients,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    updateStats(campaignData);

    if (isDbConnected()) {
      const dbCampaign = new Campaign(campaignData);
      await dbCampaign.save();

      // Log separate document for each recipient in activitylogs collection
      try {
        const activityEntries = recipients.map(r => ({
          campaignId: dbCampaign._id,
          campaignTitle: dbCampaign.title,
          email: r.email,
          fullName: r.fullName,
          trackingToken: r.trackingToken,
          eventType: 'delivered',
          status: r.status,
          urlClicked: false,
          fileOpened: false,
          clickCount: 0,
          timestamp: new Date()
        }));
        await ActivityLog.insertMany(activityEntries);
      } catch (logErr) {
        console.error('Failed to log to ActivityLog collection:', logErr.message);
      }

      return res.status(201).json(dbCampaign);
    } else {
      inMemoryStore.campaigns.unshift(campaignData);
      return res.status(201).json(campaignData);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Campaign Report
router.get('/campaigns/:id/report', async (req, res) => {
  try {
    let campaign = null;
    if (isDbConnected()) {
      try {
        campaign = await Campaign.findById(req.params.id).populate('template');
      } catch (e) {}
    }
    if (!campaign) {
      campaign = inMemoryStore.campaigns.find(c => String(c._id) === String(req.params.id));
    }
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const total = campaign.recipients.length;
    const delivered = campaign.recipients.filter(r => r.status === 'delivered').length;
    const opened = campaign.recipients.filter(r => r.opened).length;
    const clicked = campaign.recipients.filter(r => r.clicked).length;
    const attachment = campaign.recipients.filter(r => r.attachmentInteracted).length;
    const awarenessDone = campaign.recipients.filter(r => r.awarenessCompleted).length;

    const departmentStats = {};
    campaign.recipients.forEach(r => {
      const dept = r.department || 'General';
      if (!departmentStats[dept]) {
        departmentStats[dept] = { total: 0, clicked: 0, opened: 0, attachment: 0 };
      }
      departmentStats[dept].total += 1;
      if (r.opened) departmentStats[dept].opened += 1;
      if (r.clicked) departmentStats[dept].clicked += 1;
      if (r.attachmentInteracted) departmentStats[dept].attachment += 1;
    });

    res.json({
      campaignId: campaign._id,
      title: campaign.title,
      createdAt: campaign.createdAt,
      templateName: campaign.template ? (campaign.template.name || 'Simulated Scenario') : 'Standard Phishing',
      summary: {
        total,
        delivered,
        opened,
        clicked,
        attachmentInteracted: attachment,
        awarenessCompleted: awarenessDone,
        openRate: delivered ? ((opened / delivered) * 100).toFixed(1) : 0,
        clickRate: delivered ? ((clicked / delivered) * 100).toFixed(1) : 0,
        riskScore: delivered ? (((clicked + attachment) / delivered) * 100).toFixed(1) : 0
      },
      departmentBreakdown: departmentStats,
      recipients: campaign.recipients.map(r => ({
        fullName: r.fullName,
        email: r.email,
        department: r.department,
        status: r.status,
        deliveredAt: r.deliveredAt,
        opened: r.opened,
        openedAt: r.openedAt,
        clicked: r.clicked,
        clickedAt: r.clickedAt,
        attachmentInteracted: r.attachmentInteracted,
        awarenessCompleted: r.awarenessCompleted,
        riskFlag: r.clicked || r.attachmentInteracted ? 'High Susceptibility' : (r.opened ? 'Caution' : 'Safe')
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed default templates
router.post('/seed-defaults', async (req, res) => {
  try {
    if (isDbConnected()) {
      const existing = await Template.countDocuments();
      if (existing === 0) {
        await Template.insertMany(defaultTemplates);
        return res.json({ success: true, message: 'Default templates seeded successfully into MongoDB!' });
      }
      return res.json({ success: true, message: `Templates already exist in MongoDB (${existing} found).` });
    }
    return res.json({ success: true, message: 'Default templates active in-memory and ready.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
