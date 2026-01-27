const RescueTeam = require('../models/RescueTeam');

const teamController = {
  // Get all rescue teams
  getAllTeams: async (req, res) => {
    try {
      const teams = await RescueTeam.find().sort({ createdAt: -1 });
      res.json(teams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      res.status(500).json({ error: 'Failed to fetch rescue teams' });
    }
  },

  // Get team by ID
  getTeamById: async (req, res) => {
    try {
      const team = await RescueTeam.findById(req.params.id);

      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }

      res.json(team);
    } catch (error) {
      console.error('Error fetching team:', error);
      res.status(500).json({ error: 'Failed to fetch team' });
    }
  },

  // Get team members (Simplified for MongoDB)
  getTeamMembers: async (req, res) => {
    try {
      const team = await RescueTeam.findById(req.params.id);
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
      res.json(team.members || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      res.status(500).json({ error: 'Failed to fetch team members' });
    }
  },

  // Create new rescue team
  createTeam: async (req, res) => {
    try {
      const team = new RescueTeam(req.body);
      await team.save();
      res.status(201).json(team);
    } catch (error) {
      console.error('Error creating team:', error);
      res.status(500).json({ error: 'Failed to create rescue team' });
    }
  },

  // Update rescue team
  updateTeam: async (req, res) => {
    try {
      const team = await RescueTeam.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }

      res.json(team);
    } catch (error) {
      console.error('Error updating team:', error);
      res.status(500).json({ error: 'Failed to update team' });
    }
  },

  // Delete rescue team
  deleteTeam: async (req, res) => {
    try {
      const team = await RescueTeam.findByIdAndDelete(req.params.id);

      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }

      res.json({ message: 'Team deleted successfully' });
    } catch (error) {
      console.error('Error deleting team:', error);
      res.status(500).json({ error: 'Failed to delete team' });
    }
  }
};

module.exports = teamController;