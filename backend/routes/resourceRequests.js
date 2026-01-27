const express = require('express');
const router = express.Router();
const ResourceRequest = require('../models/ResourceRequest');

// Get all requests
router.get('/', async (req, res) => {
    try {
        const requests = await ResourceRequest.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching resource requests:', error);
        res.status(500).json({ error: 'Failed to fetch resource requests' });
    }
});

// Get requests by user
router.get('/user/:userId', async (req, res) => {
    try {
        const requests = await ResourceRequest.find({ requester_id: req.params.userId }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching user requests:', error);
        res.status(500).json({ error: 'Failed to fetch user requests' });
    }
});

// Get single request
router.get('/:id', async (req, res) => {
    try {
        const request = await ResourceRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.json(request);
    } catch (error) {
        console.error('Error fetching request:', error);
        res.status(500).json({ error: 'Failed to fetch request' });
    }
});

// Create new request
router.post('/', async (req, res) => {
    try {
        console.log('Creating resource request:', req.body);
        const request = new ResourceRequest(req.body);
        await request.save();
        console.log('Request saved:', request);
        res.status(201).json(request);
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ error: 'Failed to create request' });
    }
});

// Update request status
router.put('/:id', async (req, res) => {
    try {
        const request = await ResourceRequest.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.json(request);
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ error: 'Failed to update request' });
    }
});

// Delete request
router.delete('/:id', async (req, res) => {
    try {
        const request = await ResourceRequest.findByIdAndDelete(req.params.id);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.json({ message: 'Request deleted' });
    } catch (error) {
        console.error('Error deleting request:', error);
        res.status(500).json({ error: 'Failed to delete request' });
    }
});

module.exports = router;
