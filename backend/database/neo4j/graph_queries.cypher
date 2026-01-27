// ============================================================
// Neo4j Graph Queries for RescueNet
// Sample queries demonstrating graph database capabilities
// ============================================================

// ============================================================
// 1. COLLABORATION ANALYSIS QUERIES
// ============================================================

// Find all teams that coordinate with each other
MATCH (t1:Team)-[r:COORDINATES_WITH]->(t2:Team)
RETURN t1.name AS Team1, t2.name AS Team2, r.reason AS Reason;

// Find collaboration network for a specific team
MATCH (t:Team {name: 'Alpha Team'})-[:COORDINATES_WITH*1..2]-(connected:Team)
RETURN DISTINCT t.name AS MainTeam, connected.name AS ConnectedTeam;

// Find all users who are members of multiple teams
MATCH (u:User)-[:MEMBER_OF]->(t:Team)
WITH u, COUNT(t) AS teamCount, COLLECT(t.name) AS teams
WHERE teamCount > 1
RETURN u.name AS UserName, teamCount, teams;

// ============================================================
// 2. RESOURCE FLOW QUERIES
// ============================================================

// Track resource flow from centers to zones
MATCH (rc:ResourceCenter)-[sup:SUPPLIES]->(z:Zone)
RETURN rc.name AS Center, z.name AS Zone, sup.resources AS ResourcesSupplied
ORDER BY z.severity DESC;

// Find which zones are undersupplied (less than 2 resource centers)
MATCH (z:Zone)
OPTIONAL MATCH (rc:ResourceCenter)-[:SUPPLIES]->(z)
WITH z, COUNT(rc) AS supplierCount
WHERE supplierCount < 2
RETURN z.name AS Zone, z.severity AS Severity, supplierCount AS SupplierCount;

// Find all resource centers that could supply a critical zone
MATCH (z:Zone {severity: 5})
MATCH (rc:ResourceCenter)
WHERE NOT (rc)-[:SUPPLIES]->(z)
RETURN z.name AS CriticalZone, COLLECT(rc.name) AS AvailableCenters;

// ============================================================
// 3. TEAM DEPLOYMENT QUERIES
// ============================================================

// Find teams and their deployment chain
MATCH path = (t:Team)-[:BASED_AT]->(rc:ResourceCenter),
      (t)-[:ASSIGNED_TO]->(z:Zone)
RETURN t.name AS Team, rc.name AS HomeBase, z.name AS DeployedZone, z.severity AS Severity;

// Find teams available for redeployment to critical zones
MATCH (t:Team {status: 'Available'})
MATCH (z:Zone {severity: 5})
WHERE NOT (t)-[:ASSIGNED_TO]->(z)
RETURN t.name AS AvailableTeam, t.specialization, z.name AS CriticalZone;

// Find shortest path between two zones through team coordination
MATCH path = shortestPath(
  (z1:Zone {name: 'Chennai Flood Zone'})-[*]-(z2:Zone {name: 'Kerala Landslide Area'})
)
RETURN path;

// ============================================================
// 4. SHELTER CAPACITY QUERIES
// ============================================================

// Find all shelters with occupancy rate
MATCH (s:Shelter)-[:LOCATED_IN]->(z:Zone)
RETURN s.name AS Shelter, z.name AS Zone, 
       s.occupancy AS CurrentOccupancy, s.capacity AS TotalCapacity,
       round(toFloat(s.occupancy) / s.capacity * 100, 2) AS OccupancyRate
ORDER BY OccupancyRate DESC;

// Find zones with most shelter capacity available
MATCH (z:Zone)<-[:LOCATED_IN]-(s:Shelter)
WITH z, SUM(s.capacity) AS totalCapacity, SUM(s.occupancy) AS totalOccupancy
RETURN z.name AS Zone, totalCapacity - totalOccupancy AS AvailableCapacity
ORDER BY AvailableCapacity DESC;

// ============================================================
// 5. USER HIERARCHY QUERIES
// ============================================================

// Find team leadership structure
MATCH (leader:User)-[:LEADS]->(t:Team)<-[:MEMBER_OF]-(member:User)
WHERE leader <> member
RETURN leader.name AS TeamLeader, t.name AS Team, COLLECT(member.name) AS Members;

// Find coordinators and their supervision scope
MATCH (c:User {role: 'Coordinator'})-[:SUPERVISES]->(z:Zone)
OPTIONAL MATCH (t:Team)-[:ASSIGNED_TO]->(z)
RETURN c.name AS Coordinator, z.name AS Zone, COLLECT(t.name) AS TeamsInZone;

// ============================================================
// 6. PATTERN MATCHING QUERIES
// ============================================================

// Find critical zones without enough team coverage
MATCH (z:Zone {severity: 5})
OPTIONAL MATCH (t:Team)-[:ASSIGNED_TO]->(z)
WITH z, COUNT(t) AS teamCount
WHERE teamCount < 2
RETURN z.name AS UnderstaffedZone, z.disasterType, teamCount;

// Find the most connected nodes (hubs)
MATCH (n)
WHERE n:User OR n:Team OR n:Zone
OPTIONAL MATCH (n)-[r]-()
WITH n, COUNT(r) AS connections, labels(n)[0] AS nodeType
ORDER BY connections DESC
LIMIT 10
RETURN nodeType, 
       CASE WHEN n.name IS NOT NULL THEN n.name ELSE n.userId END AS NodeName, 
       connections;

// ============================================================
// 7. PATH ANALYSIS QUERIES
// ============================================================

// Find all paths from a user to a zone (how is user connected to zone)
MATCH path = (u:User {name: 'Ravi Kumar'})-[*..3]-(z:Zone)
RETURN path
LIMIT 5;

// Find resource supply chain to a specific zone
MATCH path = (rc:ResourceCenter)-[:SUPPLIES]->(z:Zone {name: 'Chennai Flood Zone'})<-[:LOCATED_IN]-(s:Shelter)
RETURN path;

// ============================================================
// 8. AGGREGATION QUERIES
// ============================================================

// Zone statistics with team and shelter counts
MATCH (z:Zone)
OPTIONAL MATCH (t:Team)-[:ASSIGNED_TO]->(z)
OPTIONAL MATCH (s:Shelter)-[:LOCATED_IN]->(z)
OPTIONAL MATCH (rc:ResourceCenter)-[:SUPPLIES]->(z)
RETURN z.name AS Zone, z.severity AS Severity, z.status AS Status,
       COUNT(DISTINCT t) AS AssignedTeams,
       COUNT(DISTINCT s) AS Shelters,
       COUNT(DISTINCT rc) AS SupplyingSources;

// User activity summary
MATCH (u:User)
OPTIONAL MATCH (u)-[:LEADS]->(teamLed:Team)
OPTIONAL MATCH (u)-[:MEMBER_OF]->(teamMember:Team)
OPTIONAL MATCH (u)-[:SUPERVISES]->(zoneSup:Zone)
RETURN u.name AS User, u.role AS Role,
       COUNT(DISTINCT teamLed) AS TeamsLed,
       COUNT(DISTINCT teamMember) AS TeamMemberships,
       COUNT(DISTINCT zoneSup) AS ZonesSupervised;
