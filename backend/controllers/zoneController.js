const DisasterZone = require('../models/DisasterZone');

const zoneController = {
  // Get all disaster zones
  getAllZones: async (req, res) => {
    try {
      const { status, severity } = req.query;
      const filter = {};
      
      if (status) filter.status = status;
      if (severity) filter.severity = severity;
      
      const zones = await DisasterZone.find(filter).sort({ declared_at: -1 });
      res.json(zones);
    } catch (error) {
      console.error('Error fetching zones:', error);
      res.status(500).json({ error: 'Failed to fetch disaster zones' });
    }
  },

  // Get zone by ID
  getZoneById: async (req, res) => {
    try {
      const zone = await DisasterZone.findById(req.params.id);
      
      if (!zone) {
        return res.status(404).json({ error: 'Zone not found' });
      }
      
      res.json(zone);
    } catch (error) {
      console.error('Error fetching zone:', error);
      res.status(500).json({ error: 'Failed to fetch zone' });
    }
  },

  // Create new disaster zone
  createZone: async (req, res) => {
    try {
      const zone = new DisasterZone(req.body);
      await zone.save();
      res.status(201).json(zone);
    } catch (error) {
      console.error('Error creating zone:', error);
      res.status(500).json({ error: 'Failed to create disaster zone' });
    }
  },

  // Update disaster zone
  updateZone: async (req, res) => {
    try {
      const zone = await DisasterZone.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!zone) {
        return res.status(404).json({ error: 'Zone not found' });
      }

      res.json(zone);
    } catch (error) {
      console.error('Error updating zone:', error);
      res.status(500).json({ error: 'Failed to update zone' });
    }
  },

  // Delete disaster zone
  deleteZone: async (req, res) => {
    try {
      const zone = await DisasterZone.findByIdAndDelete(req.params.id);

      if (!zone) {
        return res.status(404).json({ error: 'Zone not found' });
      }

      res.json({ message: 'Zone deleted successfully', zone });
    } catch (error) {
      console.error('Error deleting zone:', error);
      res.status(500).json({ error: 'Failed to delete zone' });
    }
  },

  // Get zone statistics
  getZoneStats: async (req, res) => {
    try {
      const totalZones = await DisasterZone.countDocuments();
      const activeZones = await DisasterZone.countDocuments({ status: 'active' });
      const criticalZones = await DisasterZone.countDocuments({ severity: 'critical' });
      
      const affectedResult = await DisasterZone.aggregate([
        {
          $group: {
            _id: null,
            total_affected: { $sum: '$affected_population' }
          }
        }
      ]);

      res.json({
        total_zones: totalZones,
        active_zones: activeZones,
        critical_zones: criticalZones,
        total_affected: affectedResult[0]?.total_affected || 0
      });
    } catch (error) {
      console.error('Error fetching zone stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }
};

module.exports = zoneController;