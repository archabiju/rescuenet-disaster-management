const mongoose = require('mongoose');

const citizenRequestSchema = new mongoose.Schema({
  reporter_name: {
    type: String,
    trim: true
  },
  reporter_phone: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  request_type: {
    type: String,
    required: true
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  zone_id: {
    type: String, // Relaxed to String to match potential imports
    ref: 'DisasterZone',
    required: false
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  status: {
    type: String,
    required: true,
    enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  requested_at: {
    type: Date,
    default: Date.now
  },
  resolved_at: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'citizenrequests'
});

module.exports = mongoose.model('CitizenRequest', citizenRequestSchema);