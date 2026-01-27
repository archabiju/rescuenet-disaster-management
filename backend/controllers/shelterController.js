const Shelter = require('../models/Shelter');

const shelterController = {
  // Get all shelters
  getAllShelters: async (req, res) => {
    try {
      const shelters = await Shelter.find().sort({ createdAt: -1 });
      res.json(shelters);
    } catch (error) {
      console.error('Error fetching shelters:', error);
      res.status(500).json({ error: 'Failed to fetch shelters' });
    }
  },

  // Get shelter by ID
  getShelterById: async (req, res) => {
    try {
      const shelter = await Shelter.findById(req.params.id);

      if (!shelter) {
        return res.status(404).json({ error: 'Shelter not found' });
      }

      res.json(shelter);
    } catch (error) {
      console.error('Error fetching shelter:', error);
      res.status(500).json({ error: 'Failed to fetch shelter' });
    }
  },

  // Create new shelter
  createShelter: async (req, res) => {
    try {
      const shelter = new Shelter(req.body);
      await shelter.save();
      res.status(201).json(shelter);
    } catch (error) {
      console.error('Error creating shelter:', error);
      res.status(500).json({ error: 'Failed to create shelter' });
    }
  },

  // Update shelter
  updateShelter: async (req, res) => {
    try {
      const shelter = await Shelter.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!shelter) {
        return res.status(404).json({ error: 'Shelter not found' });
      }

      res.json(shelter);
    } catch (error) {
      console.error('Error updating shelter:', error);
      res.status(500).json({ error: 'Failed to update shelter' });
    }
  },

  // Delete shelter
  deleteShelter: async (req, res) => {
    try {
      const shelter = await Shelter.findByIdAndDelete(req.params.id);

      if (!shelter) {
        return res.status(404).json({ error: 'Shelter not found' });
      }

      res.json({ message: 'Shelter deleted successfully' });
    } catch (error) {
      console.error('Error deleting shelter:', error);
      res.status(500).json({ error: 'Failed to delete shelter' });
    }
  }
};

module.exports = shelterController;