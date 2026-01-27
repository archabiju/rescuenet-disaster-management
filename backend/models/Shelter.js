const mongoose = require('mongoose');

const shelterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  current_occupancy: {
    type: Number,
    default: 0
  },
  zone_id: {
    type: String, // Relaxed to String to avoid ObjectId casting issues if data is imported
    required: false
  },
  facilities: [{
    type: String
  }],
  status: {
    type: String,
    required: true,
    enum: ['active', 'full', 'closed', 'standby'], // Added 'standby' to match potential data
    default: 'active'
  }
}, {
  timestamps: true,
  collection: 'shelters'
});

module.exports = mongoose.model('Shelter', shelterSchema);