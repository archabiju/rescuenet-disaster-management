# Database Connectivity Testing Guide

## Quick Test Commands

### Test All Databases at Once
```bash
cd backend
node test-all-databases.js
```

This will test:
- ✅ MongoDB
- ✅ PostgreSQL  
- ✅ Neo4j
- ✅ SQLite

---

## Individual Database Tests

### 1. MongoDB Test
```bash
# Via mongosh
mongosh
use disaster_management
show collections
db.disasterreports.find().limit(5)
```

### 2. PostgreSQL Test
```bash
# Via psql
psql -U postgres -d rescuenet
\dt
SELECT * FROM users LIMIT 5;
```

### 3. Neo4j Test
```bash
# Via Neo4j Browser
# Open: http://localhost:7474
# Run query:
MATCH (n) RETURN n LIMIT 10
```

### 4. SQLite Test
```bash
# Via sqlite3 command line
sqlite3 backend/database/rescuenet.db
.tables
SELECT * FROM disaster_zones;
```

---

## API Health Check

### Check All Databases via API
```bash
# Make sure backend is running first
cd backend
npm run dev

# In another terminal:
curl http://localhost:5000/api/health
```

Expected Response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-27T...",
  "databases": {
    "mongodb": { "status": "connected", ... },
    "postgresql": { "status": "connected", ... },
    "neo4j": { "status": "connected", ... },
    "sqlite": { "status": "connected", ... }
  }
}
```

---

## Individual Database API Tests

### MongoDB
```bash
curl http://localhost:5000/api/disaster-reports
```

### PostgreSQL
```bash
curl http://localhost:5000/api/pg/users
curl http://localhost:5000/api/pg/zones
```

### Neo4j
```bash
curl http://localhost:5000/api/graph/team-collaboration
```

### SQLite
```bash
curl http://localhost:5000/api/sqlite/status
curl http://localhost:5000/api/sqlite/tables
curl http://localhost:5000/api/sqlite/zones
```

---

## Troubleshooting

### MongoDB Not Connected
```bash
# Check if MongoDB is running
mongosh

# If not running, start MongoDB service
# Windows:
net start MongoDB

# Or start manually:
mongod --dbpath="C:\data\db"
```

### PostgreSQL Not Connected
```bash
# Check if PostgreSQL is running
psql -U postgres

# If not running, start PostgreSQL service
# Windows:
net start postgresql-x64-15
```

### Neo4j Not Connected
```bash
# Check Neo4j status
neo4j status

# Start Neo4j
neo4j start

# Or use Neo4j Desktop
```

### SQLite Not Connected
SQLite is file-based and doesn't require a server. If there are issues:
```bash
# Check if database file exists
ls backend/database/rescuenet.db

# If not, initialize it via API:
curl -X POST http://localhost:5000/api/sqlite/init
```

---

## Environment Variables

Make sure your `.env` file has:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/disaster_management

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=rescuenet
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=rescuenet123

# Server
PORT=5000
JWT_SECRET=your_jwt_secret
```

---

## For Review Presentation

### Before Demo:
1. Start all database services
2. Run connectivity test: `node test-all-databases.js`
3. Start backend: `npm run dev`
4. Start frontend: `cd ../frontend && npm start`
5. Open browser tools:
   - pgAdmin (PostgreSQL)
   - MongoDB Compass (MongoDB)
   - Neo4j Browser (Neo4j)
   - Any SQLite viewer

### During Demo:
1. Show health check: `http://localhost:5000/api/health`
2. Show each database tool with data
3. Run sample queries in each database
4. Show API responses
5. Show frontend integration

---

## Test Report

After running `test-all-databases.js`, check:
```bash
cat backend/database-test-report.json
```

This contains detailed connection info for all databases.
