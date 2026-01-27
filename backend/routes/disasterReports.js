const express = require('express');
const router = express.Router();
const DisasterReport = require('../models/DisasterReport');

// Get all reports
router.get('/', async (req, res) => {
    try {
        const reports = await DisasterReport.find().sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// Get single report
router.get('/:id', async (req, res) => {
    try {
        const report = await DisasterReport.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        res.json(report);
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

// Create new report
router.post('/', async (req, res) => {
    try {
        console.log('Creating disaster report:', req.body);
        const report = new DisasterReport(req.body);
        await report.save();
        console.log('Report saved:', report);
        res.status(201).json(report);
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: 'Failed to create report' });
    }
});

// Update report status
router.put('/:id', async (req, res) => {
    try {
        const report = await DisasterReport.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        res.json(report);
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({ error: 'Failed to update report' });
    }
});

// Delete report
router.delete('/:id', async (req, res) => {
    try {
        const report = await DisasterReport.findByIdAndDelete(req.params.id);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        res.json({ message: 'Report deleted' });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ error: 'Failed to delete report' });
    }
});

module.exports = router;
