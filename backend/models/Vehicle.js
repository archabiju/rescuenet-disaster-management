const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicle_no: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['ambulance', 'truck', 'boat', 'helicopter', 'van', 'suv', 'bus']
  },
  capacity: {
    type: Number,
    required: true
  },
  current_center_id: {
    type: String, // Kept generic for now to avoid validation errors with Postgres IDs
    required: false
  },
  assigned_team_id: {
    type: String,
    required: false
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'in_use', 'maintenance'],
    default: 'available'
  },
  last_maintenance: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'vehicles'
});

module.exports = mongoose.model('Vehicle', vehicleSchema);