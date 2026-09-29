const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  campaignTitle: { type: String, default: '' },
  email: { type: String, required: true },
  fullName: { type: String, default: 'User' },
  trackingToken: { type: String, required: true },
  eventType: { 
    type: String, 
    enum: ['delivered', 'opened', 'link_clicked', 'file_opened', 'awareness_completed'],
    required: true 
  },
  status: { type: String, default: 'delivered' },
  urlClicked: { type: Boolean, default: false },
  fileOpened: { type: Boolean, default: false },
  clickCount: { type: Number, default: 0 },
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
