const mongoose = require('mongoose');

const disasterZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  center_lat: {
    type: Number,
    required: true
  },
  center_lng: {
    type: Number,
    required: true
  },
  radius_meters: {
    type: Number,
    required: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  disaster_type: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'contained', 'closed'],
    default: 'active'
  },
  affected_population: {
    type: Number,
    default: 0
  },
  description: {
    type: String
  },
  declared_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'disasterzones'
});

module.exports = mongoose.model('DisasterZone', disasterZoneSchema);