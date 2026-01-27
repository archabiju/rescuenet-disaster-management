# How RescueNet Multi-Database System Works

## 🎯 Overview

Your RescueNet system now uses **THREE databases working together**:

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Port 3000)                │
│                  User Interface for Disaster Management      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Node.js Backend API (Port 5000)                 │
│                  Routes requests to appropriate database     │
└─────┬──────────────────┬──────────────────┬─────────────────┘
      │                  │                  │
      ▼                  ▼                  ▼
┌──────────┐      ┌──────────┐      ┌──────────┐
│ MongoDB  │      │PostgreSQL│      │  Neo4j   │
│ Documents│      │  Tables  │      │  Graph   │
└──────────┘      └──────────┘      └──────────┘
```

---

## 📊 Database Responsibilities

### 1. **MongoDB** (Semi-Structured Documents)
**What it stores:**
- Disaster Reports (flexible fields per disaster type)
- Resource Requests (varying requirements)
- User profiles

**Why MongoDB:**
- Different disasters need different fields (flood vs earthquake vs cyclone)
- Easy to add new fields without changing schema
- Fast for document-based queries

**Example:**
```javascript
// Flood disaster report
{
  type: "Flood",
  waterLevel: "5 feet",
  affectedHouses: 200
}

// Earthquake disaster report  
{
  type: "Earthquake",
  magnitude: 6.5,
  epicenter: {...}
}
```

**API Endpoints:**
- `GET /api/disaster-reports` - All reports
- `POST /api/disaster-reports` - Create report
- `GET /api/resource-requests` - All requests

---

### 2. **PostgreSQL** (Transactional Data + Business Logic)
**What it stores:**
- Users, Disaster Zones, Shelters
- Resource Centers, Inventories
- Rescue Teams, Vehicles
- Citizen Requests, Team Assignments

**Why PostgreSQL:**
- **ACID compliance** - Critical for inventory, team assignments
- **PL/SQL procedures** - Business logic in database
- **Triggers** - Automatic actions (logging, alerts)
- **Complex JOINs** - Relational data

**PL/SQL Features:**

| Stored Procedure | What It Does |
|------------------|--------------|
| `assign_team_to_request()` | Validates and assigns teams, updates statuses automatically |
| `allocate_resources()` | Checks inventory, deducts resources, creates allocation record |
| `get_zone_statistics()` | Calculates real-time zone stats (shelters, teams, resources) |
| `get_available_capacity()` | Computes available shelter space |
| `get_team_workload()` | Analyzes team assignments and performance |

**Triggers:**
- **Inventory Alert**: Automatically logs when resources fall below threshold
- **Audit Logging**: Tracks all changes to critical tables
- **Capacity Validation**: Prevents shelter over-booking
- **Team Count**: Auto-updates member count when adding/removing members

**API Endpoints:**
- `GET /api/pg/users` - All users from PostgreSQL
- `GET /api/pg/zones` - Disaster zones
- `POST /api/pg/assign-team` - Call PL/SQL procedure
- `POST /api/pg/allocate-resources` - Call PL/SQL procedure
- `GET /api/pg/zone-stats/:id` - Get zone statistics
- `GET /api/pg/inventory-status` - Inventory with alerts

---

### 3. **Neo4j** (Graph Relationships)
**What it stores:**
- User → Team relationships (LEADS, MEMBER_OF)
- Team → Zone assignments (ASSIGNED_TO)
- Team → Team coordination (COORDINATES_WITH)
- Resource Center → Zone supply chains (SUPPLIES)

**Why Neo4j:**
- **Relationship queries** - "Who works with whom?"
- **Path finding** - "Shortest route from team to zone"
- **Network analysis** - "Most connected coordinators"
- **Collaboration patterns** - "Which teams coordinate most?"

**Graph Queries:**
- Find all teams coordinating together
- Track resource flow from warehouses to zones
- Identify collaboration bottlenecks
- Discover shortest paths between entities

**API Endpoints:**
- `GET /api/graph/team-collaboration` - Team networks
- `GET /api/graph/resource-flow` - Supply chains
- `GET /api/graph/zone-overview` - Zone with all relationships
- `GET /api/graph/shortest-path` - Path between entities

---

## 🔄 How They Work Together

### Example: Citizen Makes Emergency Request

1. **Frontend** (React): User fills form → POST to `/api/requests`

2. **Backend** decides which database:
   - **PostgreSQL**: Stores the request record (transactional)
   - **MongoDB**: Stores detailed incident report (flexible schema)
   - **Neo4j**: Updates zone-request relationships (graph)

3. **Admin assigns team:**
   - Frontend: POST to `/api/pg/assign-team`
   - **PostgreSQL PL/SQL**: `assign_team_to_request()`
     - Validates team is available
     - Creates assignment record
     - Updates team status to "Assigned"
     - Updates request status to "Assigned"
     - **Trigger fires**: Logs to audit_log
   - **Neo4j**: Creates `(Team)-[:ASSIGNED_TO]->(Zone)` relationship

4. **Resource allocation:**
   - Frontend: POST to `/api/pg/allocate-resources`
   - **PostgreSQL PL/SQL**: `allocate_resources()`
     - Checks inventory quantity
     - Deducts from stock
     - Creates allocation record
     - **Trigger fires**: If below threshold, logs alert
   - **Neo4j**: Tracks `(Center)-[:SUPPLIES]->(Zone)` flow

5. **Analytics & Reporting:**
   - **PostgreSQL**: SQL queries for statistics
   - **MongoDB**: Aggregation pipelines for report trends
   - **Neo4j**: Graph queries for collaboration patterns

---

## 🌐 Frontend Integration

The React frontend connects to all databases through the backend API:

```javascript
// Disaster Reports (MongoDB)
fetch('/api/disaster-reports')

// Zone Statistics (PostgreSQL PL/SQL)
fetch('/api/pg/zone-stats/1')

// Team Collaboration (Neo4j Graph)
fetch('/api/graph/team-collaboration')
```

**Frontend doesn't know which database!** The backend routes to the appropriate one.

---

## 🧪 Testing Each Database

### MongoDB Test:
```bash
curl http://localhost:5000/api/disaster-reports
```

### PostgreSQL Test:
```bash
# Basic query
curl http://localhost:5000/api/pg/users

# PL/SQL function
curl http://localhost:5000/api/pg/zone-capacity/1

# Complex query with JOINs
curl http://localhost:5000/api/pg/inventory-status
```

### Neo4j Test:
```bash
# Team collaboration network
curl http://localhost:5000/api/graph/team-collaboration

# Resource flow analysis
curl http://localhost:5000/api/graph/resource-flow
```

### All Databases Health:
```bash
curl http://localhost:5000/api/health
```

---

## 📈 For Your Review/Presentation

### 1. **Show Architecture**
- Open `DATABASE_ARCHITECTURE.md` - Show the diagram

### 2. **Demonstrate PostgreSQL + PL/SQL**
- Open pgAdmin → Show tables
- Run: `SELECT * FROM get_zone_statistics(1);`
- Show triggers in audit_log table
- Call API: `/api/pg/assign-team`

### 3. **Demonstrate MongoDB**
- Open MongoDB Compass → Show collections
- Show flexible disaster report schemas
- Call API: `/api/disaster-reports`

### 4. **Demonstrate Neo4j**
- Open Neo4j Browser
- Run: `MATCH (t:Team)-[r:COORDINATES_WITH]->(t2:Team) RETURN t, r, t2`
- Show visual graph
- Call API: `/api/graph/team-collaboration`

### 5. **Show Integration**
- Open frontend: `http://localhost:3000`
- Create a disaster report (MongoDB)
- Assign a team (PostgreSQL PL/SQL)
- Show health check (all 3 databases)

---

## 🎓 Key Points for Review

1. **Polyglot Persistence**: Right database for right data type
2. **PostgreSQL PL/SQL**: Business logic in database (procedures, triggers)
3. **MongoDB Flexibility**: Different schemas for different disasters
4. **Neo4j Relationships**: Network analysis and collaboration
5. **Unified API**: Frontend doesn't care which database
6. **Real-world Architecture**: Industry-standard multi-database approach
