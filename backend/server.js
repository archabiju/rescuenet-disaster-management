const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const postgres = require('./config/postgres');
const neo4j = require('./config/neo4j');

dotenv.config();

const app = express();

// ============================================================
// DATABASE CONNECTIONS
// ============================================================

// Connect to MongoDB (for semi-structured data)
connectDB();

// Test PostgreSQL connection (for transactional data)
postgres.testConnection().then(connected => {
  if (connected) {
    console.log('✓ PostgreSQL ready for transactional data');
  }
});

// Test Neo4j connection (for graph data)
neo4j.testConnection().then(connected => {
  if (connected) {
    console.log('✓ Neo4j ready for graph queries');
  }
}).catch(err => {
  console.log('⚠️ Neo4j not available (optional):', err.message);
});

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============================================================
// ROUTES - MongoDB (Semi-structured data)
// ============================================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/disaster-reports', require('./routes/disasterReports'));
app.use('/api/resource-requests', require('./routes/resourceRequests'));

// ============================================================
// ROUTES - Mixed (using appropriate database)
// ============================================================
app.use('/api/zones', require('./routes/zones'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/shelters', require('./routes/shelters'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/vehicles', require('./routes/vehicles'));

// ============================================================
// ROUTES - PostgreSQL (Transactional data with PL/SQL)
// ============================================================
app.use('/api/pg', require('./routes/postgres/pgRoutes'));

// ============================================================
// ROUTES - Neo4j (Graph analytics)
// ============================================================
app.use('/api/graph', require('./routes/graph/graphRoutes'));

// ============================================================
// ROUTES - SQLite (Simple file-based database)
// ============================================================
app.use('/api/sqlite', require('./routes/sqlite/sqliteRoutes'));

// ============================================================
// HEALTH CHECK - All Databases
// ============================================================
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date(),
    databases: {}
  };

  // Check MongoDB
  try {
    const mongoose = require('mongoose');
    health.databases.mongodb = {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };
  } catch (err) {
    health.databases.mongodb = { status: 'error', message: err.message };
  }

  // Check PostgreSQL
  try {
    const pgResult = await postgres.query('SELECT NOW() as time');
    health.databases.postgresql = {
      status: 'connected',
      time: pgResult.rows[0].time
    };
  } catch (err) {
    health.databases.postgresql = { status: 'disconnected', message: err.message };
  }

  // Check Neo4j
  try {
    const neo4jResult = await neo4j.runQuery('RETURN datetime() as time');
    health.databases.neo4j = {
      status: 'connected',
      time: neo4jResult[0]?.get('time')?.toString() || 'connected'
    };
  } catch (err) {
    health.databases.neo4j = { status: 'disconnected', message: err.message };
  }

  // Check SQLite
  try {
    const sqlite = require('./config/sqlite');
    const sqliteStatus = await sqlite.testConnection();
    health.databases.sqlite = {
      status: sqliteStatus.connected ? 'connected' : 'disconnected',
      tables: sqliteStatus.tables
    };
  } catch (err) {
    health.databases.sqlite = { status: 'error', message: err.message };
  }

  res.json(health);
});

// ============================================================
// ROOT ENDPOINT
// ============================================================
app.get('/', (req, res) => {
  res.json({
    message: 'RescueNet - Multi-Database Disaster Management API',
    version: '2.0.0',
    databases: {
      mongodb: 'Semi-structured data (reports, requests)',
      postgresql: 'Transactional data & stored procedures',
      neo4j: 'Graph relationships & analytics',
      sqlite: 'Legacy logs & local storage'
    },
    endpoints: {
      health: '/api/health',
      // MongoDB routes
      disasterReports: '/api/disaster-reports',
      resourceRequests: '/api/resource-requests',
      // Mixed routes
      zones: '/api/zones',
      requests: '/api/requests',
      teams: '/api/teams',
      shelters: '/api/shelters',
      resources: '/api/resources',
      vehicles: '/api/vehicles',
      // PostgreSQL routes
      postgresql: '/api/pg/*',
      // Neo4j routes
      graph: '/api/graph/*'
    }
  });
});

// ============================================================
// ERROR HANDLERS
// ============================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// ============================================================
// SERVER START
// ============================================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n================================================');
  console.log('🚀 RescueNet - Multi-Database Backend');
  console.log('================================================');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log('================================================');
  console.log('📦 Databases:');
  console.log('   • MongoDB   → Semi-structured documents');
  console.log('   • PostgreSQL → Transactional data + PL/SQL');
  console.log('   • Neo4j     → Graph relationships');
  console.log('================================================\n');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await postgres.closePool();
  await neo4j.closeDriver();
  process.exit(0);
});
