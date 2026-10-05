const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  scenario: { 
    type: String, 
    enum: ['password_reset', 'account_verification', 'security_alert', 'urgent_hr', 'invoice_attachment', 'festive_gift'],
    default: 'password_reset'
  },
  senderName: { type: String, required: true },
  senderEmail: { type: String, required: true },
  subject: { type: String, required: true },
  bodyText: { type: String },
  bodyHtml: { type: String, required: true },
  callToActionText: { type: String, default: 'Review Activity Now' },
  simulatedAttachmentName: { type: String, default: '' },
  hasAttachment: { type: Boolean, default: false },
  redFlags: [{ type: String }], // Educational indicators explained in training
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Template', templateSchema);
