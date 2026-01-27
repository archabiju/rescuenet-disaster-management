const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  code: {
    type: String, // Ensure uniqueness in logic or seed, but loose here to prevent import errors
    required: false,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  critical_threshold: {
    type: Number,
    default: 10
  },
  description: {
    type: String
  },
  inventories: [{
    center_id: {
      type: String, // Relaxed to String for compatibility
      required: false
    },
    quantity: {
      type: Number,
      default: 0
    },
    last_updated: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  collection: 'resources'
});

module.exports = mongoose.model('Resource', resourceSchema);