const mongoose = require('mongoose');

const disasterReportSchema = new mongoose.Schema({
    location_lat: {
        type: Number,
        required: true
    },
    location_lng: {
        type: Number,
        required: true
    },
    disaster_type: {
        type: String,
        enum: ['flood', 'earthquake', 'cyclone', 'landslide', 'fire', 'other'],
        required: true
    },
    severity_estimate: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    description: {
        type: String,
        required: true
    },
    reporter_name: {
        type: String,
        required: true
    },
    reporter_phone: {
        type: String,
        required: true
    },
    reporter_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    zone_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DisasterZone'
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DisasterReport', disasterReportSchema);
