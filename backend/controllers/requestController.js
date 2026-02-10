const mysql = require('../config/mysql');

const requestController = {
  // Get all citizen requests (with filters)
  getAllRequests: async (req, res) => {
    try {
      const { status, priority, zone_id } = req.query;
      let sql = `
        SELECT cr.*, dz.name AS zone_name, dz.severity 
        FROM citizen_requests cr
        LEFT JOIN disaster_zones dz ON cr.zone_id = dz.zone_id
      `;
      const conditions = [];
      const params = [];

      if (status) {
        conditions.push('cr.status = ?');
        params.push(status);
      }
      if (priority) {
        conditions.push('cr.priority = ?');
        params.push(priority);
      }
      if (zone_id) {
        conditions.push('cr.zone_id = ?');
        params.push(zone_id);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' ORDER BY cr.priority DESC, cr.created_at DESC';

      const requests = await mysql.query(sql, params);
      res.json(requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      res.status(500).json({ error: 'Failed to fetch citizen requests' });
    }
  },

  // Get request by ID
  getRequestById: async (req, res) => {
    try {
      const [request] = await mysql.query(
        'SELECT cr.*, dz.name AS zone_name FROM citizen_requests cr LEFT JOIN disaster_zones dz ON cr.zone_id = dz.zone_id WHERE cr.request_id = ?',
        [req.params.id]
      );

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
      const { reporter_name, reporter_phone, description, request_type, lat, lng, zone_id, priority, status } = req.body;

      // Map string priority to number if needed
      let priorityNum = priority;
      if (typeof priority === 'string') {
        const priorityMap = { low: 1, medium: 2, high: 3, critical: 5 };
        priorityNum = priorityMap[priority.toLowerCase()] || 1;
      }

      const result = await mysql.query(
        'INSERT INTO citizen_requests (reporter_name, reporter_phone, description, lat, lng, zone_id, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          reporter_name || 'Anonymous',
          reporter_phone || null,
          description || (request_type ? `${request_type} request` : 'No description'),
          lat || null,
          lng || null,
          zone_id || null,
          priorityNum || 1,
          status || 'Pending'
        ]
      );

      // Fetch the newly created request to return it
      const [newRequest] = await mysql.query(
        'SELECT * FROM citizen_requests WHERE request_id = ?',
        [result.insertId]
      );

      res.status(201).json(newRequest);
    } catch (error) {
      console.error('Error creating request:', error);
      res.status(500).json({ error: 'Failed to create citizen request' });
    }
  },

  // Update citizen request
  updateRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Build dynamic update query
      const fields = [];
      const params = [];

      if (updates.status !== undefined) {
        fields.push('status = ?');
        params.push(updates.status);
      }
      if (updates.priority !== undefined) {
        let priorityNum = updates.priority;
        if (typeof updates.priority === 'string') {
          const priorityMap = { low: 1, medium: 2, high: 3, critical: 5 };
          priorityNum = priorityMap[updates.priority.toLowerCase()] || updates.priority;
        }
        fields.push('priority = ?');
        params.push(priorityNum);
      }
      if (updates.reporter_name !== undefined) {
        fields.push('reporter_name = ?');
        params.push(updates.reporter_name);
      }
      if (updates.reporter_phone !== undefined) {
        fields.push('reporter_phone = ?');
        params.push(updates.reporter_phone);
      }
      if (updates.description !== undefined) {
        fields.push('description = ?');
        params.push(updates.description);
      }
      if (updates.zone_id !== undefined) {
        fields.push('zone_id = ?');
        params.push(updates.zone_id || null);
      }

      if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      params.push(id);
      await mysql.query(
        `UPDATE citizen_requests SET ${fields.join(', ')} WHERE request_id = ?`,
        params
      );

      const [updated] = await mysql.query('SELECT * FROM citizen_requests WHERE request_id = ?', [id]);
      if (!updated) {
        return res.status(404).json({ error: 'Request not found' });
      }

      res.json(updated);
    } catch (error) {
      console.error('Error updating request:', error);
      res.status(500).json({ error: 'Failed to update request' });
    }
  },

  // Delete citizen request
  deleteRequest: async (req, res) => {
    try {
      const { id } = req.params;

      // First delete any team_assignments that reference this request
      await mysql.query('DELETE FROM team_assignments WHERE request_id = ?', [id]);

      const result = await mysql.query('DELETE FROM citizen_requests WHERE request_id = ?', [id]);

      if (result.affectedRows === 0) {
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
      const [total] = await mysql.query('SELECT COUNT(*) as count FROM citizen_requests');
      const [pending] = await mysql.query("SELECT COUNT(*) as count FROM citizen_requests WHERE status = 'Pending'");
      const [inProgress] = await mysql.query("SELECT COUNT(*) as count FROM citizen_requests WHERE status = 'In Progress'");
      const [resolved] = await mysql.query("SELECT COUNT(*) as count FROM citizen_requests WHERE status = 'Resolved'");
      const [critical] = await mysql.query('SELECT COUNT(*) as count FROM citizen_requests WHERE priority >= 4');

      res.json({
        total_requests: total.count,
        open_requests: pending.count,
        in_progress_requests: inProgress.count,
        critical_requests: critical.count,
        resolved_requests: resolved.count
      });
    } catch (error) {
      console.error('Error fetching request stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }
};

module.exports = requestController;