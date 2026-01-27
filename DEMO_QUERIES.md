# RescueNet Demo Queries

Quick reference for demonstrating all three databases in your review/presentation.

---

## PostgreSQL Demo (Transactional + PL/SQL)

### Via psql or pgAdmin:

```sql
-- Connect to database
\c rescuenet

-- Show all tables
\dt

-- View users with role
SELECT user_id, full_name, email, role FROM users;

-- Complex JOIN: Shelters with zone info
SELECT s.name, s.capacity, s.current_occupancy, dz.name as zone, dz.severity
FROM shelters s
JOIN disaster_zones dz ON s.zone_id = dz.zone_id;

-- Call PL/SQL Function: Zone capacity
SELECT * FROM get_available_capacity(1);

-- Call PL/SQL Function: Zone statistics
SELECT * FROM get_zone_statistics(1);

-- Call PL/SQL Function: Team workload
SELECT * FROM get_team_workload();

-- Call PL/SQL Procedure: Assign team
SELECT * FROM assign_team_to_request(1, 1, 2);

-- Call PL/SQL Procedure: Allocate resources
SELECT * FROM allocate_resources(1, 1, 1, 50, 1);

-- View audit log (populated by triggers)
SELECT * FROM audit_log ORDER BY performed_at DESC;

-- Inventory with critical alerts
SELECT rc.name, r.name as resource, i.quantity, r.critical_threshold,
  CASE WHEN i.quantity <= r.critical_threshold THEN 'CRITICAL' ELSE 'OK' END as status
FROM inventories i
JOIN resource_centers rc ON i.center_id = rc.center_id
JOIN resources r ON i.resource_id = r.resource_id;
```

### Via API (curl/Postman):

```bash
# Initialize (run once)
curl -X POST http://localhost:5000/api/pg/init
curl -X POST http://localhost:5000/api/pg/seed

# Get data
curl http://localhost:5000/api/pg/users
curl http://localhost:5000/api/pg/zones
curl http://localhost:5000/api/pg/shelters

# PL/SQL demos
curl http://localhost:5000/api/pg/zone-capacity/1
curl http://localhost:5000/api/pg/zone-stats/1
curl http://localhost:5000/api/pg/team-workload
curl http://localhost:5000/api/pg/inventory-status
```

---

## MongoDB Demo (Document-Based)

### Via MongoDB Compass or mongosh:

```javascript
// Switch to database
use disaster_management

// Show collections
show collections

// Find all disaster reports
db.disasterreports.find().pretty()

// Find reports by type (flexible schema)
db.disasterreports.find({ severity: "High" })

// Aggregation pipeline: Reports by zone
db.disasterreports.aggregate([
  { $group: { _id: "$disasterType", count: { $sum: 1 } } }
])

// Resource requests with nested data
db.resourcerequests.find().pretty()
```

### Via API:

```bash
# Disaster reports (semi-structured)
curl http://localhost:5000/api/disaster-reports

# Resource requests
curl http://localhost:5000/api/resource-requests
```

---

## Neo4j Demo (Graph Relationships)

### Via Neo4j Browser:

```cypher
// View all nodes
MATCH (n) RETURN n LIMIT 50

// Team collaboration network
MATCH (t1:Team)-[r:COORDINATES_WITH]->(t2:Team)
RETURN t1, r, t2

// User relationships visualization
MATCH (u:User)-[r]->(t:Team)
RETURN u, r, t

// Resource flow from centers to zones
MATCH path = (rc:ResourceCenter)-[:SUPPLIES]->(z:Zone)
RETURN path

// Full zone network
MATCH (z:Zone)<-[:ASSIGNED_TO]-(t:Team)
OPTIONAL MATCH (z)<-[:LOCATED_IN]-(s:Shelter)
OPTIONAL MATCH (z)<-[:SUPPLIES]-(rc:ResourceCenter)
RETURN z, t, s, rc

// Shortest path between entities
MATCH path = shortestPath(
  (t:Team {name: 'Alpha Team'})-[*]-(z:Zone {name: 'Kerala Landslide Area'})
)
RETURN path

// Hub analysis (most connected)
MATCH (n)-[r]-()
RETURN labels(n)[0] as type, n.name as name, count(r) as connections
ORDER BY connections DESC
LIMIT 10
```

### Via API:

```bash
# Initialize (run once)
curl -X POST http://localhost:5000/api/graph/init
curl -X POST http://localhost:5000/api/graph/seed

# Graph queries
curl http://localhost:5000/api/graph/team-collaboration
curl http://localhost:5000/api/graph/user-network
curl http://localhost:5000/api/graph/resource-flow
curl http://localhost:5000/api/graph/zone-overview
curl http://localhost:5000/api/graph/most-connected
curl "http://localhost:5000/api/graph/shortest-path?from=Alpha Team&to=Kerala Landslide Area"
```

---

## Health Check (All Databases)

```bash
curl http://localhost:5000/api/health
```

Shows connection status for MongoDB, PostgreSQL, and Neo4j.
