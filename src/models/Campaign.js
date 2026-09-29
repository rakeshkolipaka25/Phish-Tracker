const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
  email: { type: String, required: true },
  fullName: { type: String, required: true },
  department: { type: String, default: 'General' },
  authorized: { type: Boolean, default: true },
  trackingToken: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['pending', 'delivered', 'failed'],
    default: 'pending'
  },
  deliveredAt: { type: Date },
  opened: { type: Boolean, default: false },
  openedAt: { type: Date },
  openCount: { type: Number, default: 0 },
  clicked: { type: Boolean, default: false },
  clickedAt: { type: Date },
  clickCount: { type: Number, default: 0 },
  attachmentInteracted: { type: Boolean, default: false },
  attachmentInteractedAt: { type: Date },
  awarenessCompleted: { type: Boolean, default: false },
  awarenessCompletedAt: { type: Date },
  ipAddress: { type: String },
  userAgent: { type: String }
});

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  template: { type: mongoose.Schema.Types.Mixed },
  status: { 
    type: String, 
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'active'
  },
  recipients: [recipientSchema],
  stats: {
    totalRecipients: { type: Number, default: 0 },
    deliveredCount: { type: Number, default: 0 },
    openedCount: { type: Number, default: 0 },
    clickedCount: { type: Number, default: 0 },
    attachmentInteractedCount: { type: Number, default: 0 },
    awarenessCompletedCount: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema);
