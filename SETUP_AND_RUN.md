# RescueNet Setup & Run Guide

## Quick Start (Without Neo4j for now)

Since Neo4j is still installing, we can run the system with PostgreSQL and MongoDB first.

### Step 1: Create PostgreSQL Database

Open **pgAdmin** (should be installed with PostgreSQL):
1. Right-click on "Databases"
2. Create → Database
3. Name: `rescuenet`
4. Click "Save"

### Step 2: Initialize PostgreSQL Tables

In pgAdmin, open Query Tool for `rescuenet` database and run these files in order:

1. **Schema** - Copy/paste from: `backend/database/postgresql/schema.sql`
2. **Procedures** - Copy/paste from: `backend/database/postgresql/stored_procedures.sql`
3. **Triggers** - Copy/paste from: `backend/database/postgresql/triggers.sql`
4. **Seed Data** - Copy/paste from: `backend/database/postgresql/seed.sql`

### Step 3: Start Backend

```bash
cd backend
npm run dev
```

The server will start on `http://localhost:5000`

### Step 4: Start Frontend

Open a new terminal:
```bash
cd frontend
npm start
```

The React app will open on `http://localhost:3000`

---

## How It Works

### MongoDB (Already Working)
- **Disaster Reports**: `/api/disaster-reports`
- **Resource Requests**: `/api/resource-requests`
- Flexible document structure for varying disaster types

### PostgreSQL (New - Transactional Data)
- **Core Data**: Users, zones, shelters, teams, vehicles
- **PL/SQL Business Logic**: 
  - `assign_team_to_request()` - Auto-assigns teams
  - `allocate_resources()` - Manages inventory
  - `get_zone_statistics()` - Real-time stats
- **Triggers**: Auto-logging, threshold alerts
- **Access via**: `/api/pg/*` endpoints

### Neo4j (Optional - Graph Analysis)
- **When installed**: Team collaboration networks
- **Graph Queries**: Resource flow, shortest paths
- **Access via**: `/api/graph/*` endpoints
- **Note**: Backend works fine without Neo4j (it's optional)

---

## Testing the Databases

### 1. Check Health
```
http://localhost:5000/api/health
```
Shows status of all databases

### 2. Test PostgreSQL
```
http://localhost:5000/api/pg/users
http://localhost:5000/api/pg/zones
http://localhost:5000/api/pg/zone-stats/1
```

### 3. Test MongoDB
```
http://localhost:5000/api/disaster-reports
http://localhost:5000/api/zones
```

### 4. Test PL/SQL Procedures
Use Postman or curl:
```bash
# Get zone capacity (PL/SQL function)
curl http://localhost:5000/api/pg/zone-capacity/1

# Get team workload (PL/SQL function)
curl http://localhost:5000/api/pg/team-workload
```

---

## For Your Review/Presentation

1. **Show pgAdmin** - Display PostgreSQL tables and data
2. **Show MongoDB Compass** - Display document collections
3. **Show API Health** - All databases connected
4. **Run PL/SQL** - Call stored procedures via API
5. **Show Triggers** - Demonstrate auto-logging

When Neo4j finishes installing, you can add graph visualization!
