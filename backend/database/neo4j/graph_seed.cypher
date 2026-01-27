// ============================================================
// Neo4j Seed Data for RescueNet
// Creates graph nodes and relationships
// ============================================================

// ============================================================
// CREATE USER NODES
// ============================================================
CREATE (u1:User {userId: 1, name: 'Admin User', email: 'admin@gmail.com', role: 'Admin'})
CREATE (u2:User {userId: 2, name: 'Ravi Kumar', email: 'ravi@gmail.com', role: 'Coordinator'})
CREATE (u3:User {userId: 3, name: 'Anita Sharma', email: 'anita@gmail.com', role: 'Responder'})
CREATE (u4:User {userId: 4, name: 'Rahul Das', email: 'rahul@gmail.com', role: 'Volunteer'})
CREATE (u5:User {userId: 5, name: 'Neha Verma', email: 'neha@gmail.com', role: 'Responder'})
CREATE (u6:User {userId: 6, name: 'Amit Singh', email: 'amit@gmail.com', role: 'Volunteer'})
CREATE (u7:User {userId: 7, name: 'Priya Menon', email: 'priya@gmail.com', role: 'Coordinator'})

// ============================================================
// CREATE TEAM NODES
// ============================================================
CREATE (t1:Team {teamId: 1, name: 'Alpha Team', status: 'Available', specialization: 'Search & Rescue'})
CREATE (t2:Team {teamId: 2, name: 'Bravo Team', status: 'Assigned', specialization: 'Medical Support'})
CREATE (t3:Team {teamId: 3, name: 'Charlie Team', status: 'Available', specialization: 'Logistics'})
CREATE (t4:Team {teamId: 4, name: 'Delta Team', status: 'Available', specialization: 'Evacuation'})

// ============================================================
// CREATE ZONE NODES
// ============================================================
CREATE (z1:Zone {zoneId: 1, name: 'Chennai Flood Zone', severity: 4, status: 'Active', disasterType: 'Flood'})
CREATE (z2:Zone {zoneId: 2, name: 'Kerala Landslide Area', severity: 5, status: 'Active', disasterType: 'Landslide'})
CREATE (z3:Zone {zoneId: 3, name: 'Odisha Cyclone Zone', severity: 5, status: 'Active', disasterType: 'Cyclone'})
CREATE (z4:Zone {zoneId: 4, name: 'Assam Flood Area', severity: 4, status: 'Active', disasterType: 'Flood'})

// ============================================================
// CREATE RESOURCE CENTER NODES
// ============================================================
CREATE (rc1:ResourceCenter {centerId: 1, name: 'Chennai Warehouse', address: 'Chennai'})
CREATE (rc2:ResourceCenter {centerId: 2, name: 'Kochi Warehouse', address: 'Kochi'})
CREATE (rc3:ResourceCenter {centerId: 3, name: 'Odisha Supply Hub', address: 'Bhubaneswar'})
CREATE (rc4:ResourceCenter {centerId: 4, name: 'Assam Central Store', address: 'Guwahati'})

// ============================================================
// CREATE SHELTER NODES
// ============================================================
CREATE (s1:Shelter {shelterId: 1, name: 'Chennai Central Shelter', capacity: 500, occupancy: 120})
CREATE (s2:Shelter {shelterId: 2, name: 'Kerala Relief Camp', capacity: 300, occupancy: 80})
CREATE (s3:Shelter {shelterId: 3, name: 'Odisha Emergency Camp', capacity: 400, occupancy: 150})
CREATE (s4:Shelter {shelterId: 4, name: 'Assam Relief Center', capacity: 350, occupancy: 100});

// ============================================================
// CREATE RELATIONSHIPS
// ============================================================

// Users as Team Leaders (LEADS relationship)
MATCH (u:User {userId: 3}), (t:Team {teamId: 1}) CREATE (u)-[:LEADS]->(t);
MATCH (u:User {userId: 4}), (t:Team {teamId: 2}) CREATE (u)-[:LEADS]->(t);
MATCH (u:User {userId: 5}), (t:Team {teamId: 3}) CREATE (u)-[:LEADS]->(t);
MATCH (u:User {userId: 6}), (t:Team {teamId: 4}) CREATE (u)-[:LEADS]->(t);

// Users as Team Members (MEMBER_OF relationship)
MATCH (u:User {userId: 3}), (t:Team {teamId: 1}) CREATE (u)-[:MEMBER_OF {since: date()}]->(t);
MATCH (u:User {userId: 4}), (t:Team {teamId: 1}) CREATE (u)-[:MEMBER_OF {since: date()}]->(t);
MATCH (u:User {userId: 4}), (t:Team {teamId: 2}) CREATE (u)-[:MEMBER_OF {since: date()}]->(t);
MATCH (u:User {userId: 5}), (t:Team {teamId: 3}) CREATE (u)-[:MEMBER_OF {since: date()}]->(t);
MATCH (u:User {userId: 6}), (t:Team {teamId: 3}) CREATE (u)-[:MEMBER_OF {since: date()}]->(t);
MATCH (u:User {userId: 7}), (t:Team {teamId: 4}) CREATE (u)-[:MEMBER_OF {since: date()}]->(t);

// Teams assigned to Zones (ASSIGNED_TO relationship)
MATCH (t:Team {teamId: 1}), (z:Zone {zoneId: 1}) CREATE (t)-[:ASSIGNED_TO {assignedAt: datetime(), priority: 3}]->(z);
MATCH (t:Team {teamId: 2}), (z:Zone {zoneId: 2}) CREATE (t)-[:ASSIGNED_TO {assignedAt: datetime(), priority: 5}]->(z);
MATCH (t:Team {teamId: 3}), (z:Zone {zoneId: 3}) CREATE (t)-[:ASSIGNED_TO {assignedAt: datetime(), priority: 5}]->(z);
MATCH (t:Team {teamId: 4}), (z:Zone {zoneId: 4}) CREATE (t)-[:ASSIGNED_TO {assignedAt: datetime(), priority: 4}]->(z);

// Shelters located in Zones (LOCATED_IN relationship)
MATCH (s:Shelter {shelterId: 1}), (z:Zone {zoneId: 1}) CREATE (s)-[:LOCATED_IN]->(z);
MATCH (s:Shelter {shelterId: 2}), (z:Zone {zoneId: 2}) CREATE (s)-[:LOCATED_IN]->(z);
MATCH (s:Shelter {shelterId: 3}), (z:Zone {zoneId: 3}) CREATE (s)-[:LOCATED_IN]->(z);
MATCH (s:Shelter {shelterId: 4}), (z:Zone {zoneId: 4}) CREATE (s)-[:LOCATED_IN]->(z);

// Resource Centers supply Zones (SUPPLIES relationship)
MATCH (rc:ResourceCenter {centerId: 1}), (z:Zone {zoneId: 1}) CREATE (rc)-[:SUPPLIES {resources: ['Water', 'Medical Kits']}]->(z);
MATCH (rc:ResourceCenter {centerId: 2}), (z:Zone {zoneId: 2}) CREATE (rc)-[:SUPPLIES {resources: ['Blankets', 'First Aid']}]->(z);
MATCH (rc:ResourceCenter {centerId: 3}), (z:Zone {zoneId: 3}) CREATE (rc)-[:SUPPLIES {resources: ['Rice', 'Water']}]->(z);
MATCH (rc:ResourceCenter {centerId: 4}), (z:Zone {zoneId: 4}) CREATE (rc)-[:SUPPLIES {resources: ['Baby Food', 'Blankets']}]->(z);

// Teams based at Resource Centers (BASED_AT relationship)
MATCH (t:Team {teamId: 1}), (rc:ResourceCenter {centerId: 1}) CREATE (t)-[:BASED_AT]->(rc);
MATCH (t:Team {teamId: 2}), (rc:ResourceCenter {centerId: 2}) CREATE (t)-[:BASED_AT]->(rc);
MATCH (t:Team {teamId: 3}), (rc:ResourceCenter {centerId: 3}) CREATE (t)-[:BASED_AT]->(rc);
MATCH (t:Team {teamId: 4}), (rc:ResourceCenter {centerId: 4}) CREATE (t)-[:BASED_AT]->(rc);

// Team Coordination (COORDINATES_WITH relationship)
MATCH (t1:Team {teamId: 1}), (t2:Team {teamId: 2}) CREATE (t1)-[:COORDINATES_WITH {reason: 'Medical backup for rescue operations'}]->(t2);
MATCH (t2:Team {teamId: 2}), (t3:Team {teamId: 3}) CREATE (t2)-[:COORDINATES_WITH {reason: 'Logistics support for medical team'}]->(t3);
MATCH (t3:Team {teamId: 3}), (t4:Team {teamId: 4}) CREATE (t3)-[:COORDINATES_WITH {reason: 'Supply chain for evacuation'}]->(t4);

// Coordinators supervise zones (SUPERVISES relationship)
MATCH (u:User {userId: 2}), (z:Zone {zoneId: 1}) CREATE (u)-[:SUPERVISES]->(z);
MATCH (u:User {userId: 2}), (z:Zone {zoneId: 4}) CREATE (u)-[:SUPERVISES]->(z);
MATCH (u:User {userId: 7}), (z:Zone {zoneId: 2}) CREATE (u)-[:SUPERVISES]->(z);
MATCH (u:User {userId: 7}), (z:Zone {zoneId: 3}) CREATE (u)-[:SUPERVISES]->(z);
