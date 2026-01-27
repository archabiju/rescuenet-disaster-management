const mongoose = require('mongoose');

const resourceInventorySchema = new mongoose.Schema({
    center_id: {
        type: String, // Keeping loose for flexibility
        required: true,
        ref: 'ResourceCenter'
    },
    center_name: { // Denormalized field from screenshot
        type: String
    },
    resource_id: {
        type: String,
        required: true,
        ref: 'Resource'
    },
    resource_name: { // Denormalized field from screenshot
        type: String
    },
    quantity: {
        type: Number,
        default: 0
    },
    unit: { // Denormalized field from screenshot
        type: String
    },
    critical_threshold: { // Denormalized field from screenshot
        type: Number
    },
    status: {
        type: String,
        enum: ['available', 'low_stock', 'out_of_stock'],
        default: 'available'
    },
    last_maintenance: { // Seen in vehicle, might be irrelevant here but keeping schema clean
        type: Date
    },
    last_updated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'resourceinventories'
});

module.exports = mongoose.model('ResourceInventory', resourceInventorySchema);
