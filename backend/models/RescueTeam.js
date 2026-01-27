const mongoose = require('mongoose');

const rescueTeamSchema = new mongoose.Schema({
  team_name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'deployed', 'maintenance', 'active'], // Added 'active'
    default: 'available'
  },
  home_center_id: {
    type: String, // Relaxed to String
    required: false
  },
  specialization: {
    type: String
  },
  members: [{
    user_id: String,
    role_in_team: String,
    joined_at: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  collection: 'rescueteams'
});

module.exports = mongoose.model('RescueTeam', rescueTeamSchema);