const mongoose = require('mongoose');

const resourceRequestSchema = new mongoose.Schema({
    requester_name: {
        type: String,
        required: true
    },
    requester_phone: {
        type: String,
        required: true
    },
    requester_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    location: {
        type: String,
        required: true
    },
    urgency: {
        type: String,
        enum: ['low', 'normal', 'high', 'critical'],
        default: 'normal'
    },
    items: [{
        resource_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ResourceInventory'
        },
        resource_name: String,
        quantity: Number,
        unit: String
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'in_transit', 'delivered', 'rejected'],
        default: 'pending'
    },
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('ResourceRequest', resourceRequestSchema);
