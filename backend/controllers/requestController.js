const CitizenRequest = require('../models/CitizenRequest');

const requestController = {
  // Get all citizen requests (with filters)
  getAllRequests: async (req, res) => {
    try {
      const { status, priority, zone_id } = req.query;
      let query = {};

      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (zone_id) query.zone_id = zone_id;

      const requests = await CitizenRequest.find(query).sort({ priority: -1, requested_at: -1 });
      res.json(requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      res.status(500).json({ error: 'Failed to fetch citizen requests' });
    }
  },

  // Get request by ID
  getRequestById: async (req, res) => {
    try {
      const request = await CitizenRequest.findById(req.params.id);

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      res.json(request);
    } catch (error) {
      console.error('Error fetching request:', error);
      res.status(500).json({ error: 'Failed to fetch request' });
    }
  },

  // Create new citizen request
  createRequest: async (req, res) => {
    try {
      const request = new CitizenRequest(req.body);
      await request.save();
      res.status(201).json(request);
    } catch (error) {
      console.error('Error creating request:', error);
      res.status(500).json({ error: 'Failed to create citizen request' });
    }
  },

  // Update citizen request
  updateRequest: async (req, res) => {
    try {
      const request = await CitizenRequest.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      res.json(request);
    } catch (error) {
      console.error('Error updating request:', error);
      res.status(500).json({ error: 'Failed to update request' });
    }
  },

  // Delete citizen request
  deleteRequest: async (req, res) => {
    try {
      const request = await CitizenRequest.findByIdAndDelete(req.params.id);

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      res.json({ message: 'Request deleted successfully' });
    } catch (error) {
      console.error('Error deleting request:', error);
      res.status(500).json({ error: 'Failed to delete request' });
    }
  },

  // Get request statistics
  getRequestStats: async (req, res) => {
    try {
      const total_requests = await CitizenRequest.countDocuments();
      const open_requests = await CitizenRequest.countDocuments({ status: 'open' });
      const in_progress_requests = await CitizenRequest.countDocuments({ status: 'in_progress' });
      const critical_requests = await CitizenRequest.countDocuments({ priority: 'critical' });
      const resolved_requests = await CitizenRequest.countDocuments({ status: 'resolved' });

      res.json({
        total_requests,
        open_requests,
        in_progress_requests,
        critical_requests,
        resolved_requests
      });
    } catch (error) {
      console.error('Error fetching request stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }
};

module.exports = requestController;