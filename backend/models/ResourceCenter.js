const mongoose = require('mongoose');

const resourceCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  address: {
    type: String
  },
  contact_person: {
    type: String
  },
  contact_phone: {
    type: String
  },
  operational_status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ResourceCenter', resourceCenterSchema);