const Resource = require('../models/Resource');
const ResourceCenter = require('../models/ResourceCenter');
const ResourceInventory = require('../models/ResourceInventory');

const resourceController = {
  // Get all resources
  getAllResources: async (req, res) => {
    try {
      const resources = await Resource.find().sort({ name: 1 });
      res.json(resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      res.status(500).json({ error: 'Failed to fetch resources' });
    }
  },

  // Get all inventories (Directly from collection, using denormalized fields)
  getAllInventories: async (req, res) => {
    try {
      const inventories = await ResourceInventory.find();

      // Since the data is denormalized in MongoDB (as seen in screenshots), 
      // we can just map the fields directly.
      const mappedInventories = inventories.map(inv => ({
        _id: inv._id,
        // Use denormalized name if available, fallback to generic
        resource_name: inv.resource_name || 'Unknown Resource',
        center_name: inv.center_name || 'Unknown Center',
        center_id: inv.center_id,
        resource_id: inv.resource_id,
        quantity: inv.quantity,
        unit: inv.unit || 'units',
        critical_threshold: inv.critical_threshold,
        status: inv.status || 'available'
      }));

      res.json(mappedInventories);
    } catch (error) {
      console.error('Error fetching inventories:', error);
      res.status(500).json({ error: 'Failed to fetch inventories' });
    }
  },

  // Get all resource centers
  getAllCenters: async (req, res) => {
    try {
      const centers = await ResourceCenter.find().sort({ name: 1 });
      res.json(centers);
    } catch (error) {
      console.error('Error fetching centers:', error);
      res.status(500).json({ error: 'Failed to fetch resource centers' });
    }
  },

  // Get inventory by center
  getInventoryByCenter: async (req, res) => {
    try {
      const { centerId } = req.params;
      const inventories = await ResourceInventory.find({ center_id: centerId });

      const mappedInventories = inventories.map(inv => ({
        resource_name: inv.resource_name || 'Unknown',
        quantity: inv.quantity,
        unit: inv.unit || '',
        status: inv.status || 'available'
      }));

      res.json(mappedInventories);
    } catch (error) {
      console.error('Error fetching center inventory:', error);
      res.status(500).json({ error: 'Failed to fetch center inventory' });
    }
  },

  // Update Inventory
  updateInventory: async (req, res) => {
    try {
      const inventory = new ResourceInventory(req.body);
      await inventory.save();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: 'Failed' });
    }
  }
};

module.exports = resourceController;