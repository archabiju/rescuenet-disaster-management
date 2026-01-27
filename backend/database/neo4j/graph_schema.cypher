// ============================================================
// Neo4j Graph Schema for RescueNet
// Cypher commands to set up the graph database
// ============================================================

// ============================================================
// CONSTRAINTS - Ensure data integrity
// ============================================================

// Unique constraint on User nodes
CREATE CONSTRAINT user_id_unique IF NOT EXISTS
FOR (u:User) REQUIRE u.userId IS UNIQUE;

// Unique constraint on Team nodes
CREATE CONSTRAINT team_id_unique IF NOT EXISTS
FOR (t:Team) REQUIRE t.teamId IS UNIQUE;

// Unique constraint on Zone nodes
CREATE CONSTRAINT zone_id_unique IF NOT EXISTS
FOR (z:Zone) REQUIRE z.zoneId IS UNIQUE;

// Unique constraint on ResourceCenter nodes
CREATE CONSTRAINT center_id_unique IF NOT EXISTS
FOR (rc:ResourceCenter) REQUIRE rc.centerId IS UNIQUE;

// Unique constraint on Shelter nodes
CREATE CONSTRAINT shelter_id_unique IF NOT EXISTS
FOR (s:Shelter) REQUIRE s.shelterId IS UNIQUE;

// ============================================================
// INDEXES - Optimize query performance
// ============================================================

// Index on User properties
CREATE INDEX user_role_index IF NOT EXISTS
FOR (u:User) ON (u.role);

CREATE INDEX user_name_index IF NOT EXISTS
FOR (u:User) ON (u.name);

// Index on Zone properties
CREATE INDEX zone_status_index IF NOT EXISTS
FOR (z:Zone) ON (z.status);

CREATE INDEX zone_severity_index IF NOT EXISTS
FOR (z:Zone) ON (z.severity);

// Index on Team status
CREATE INDEX team_status_index IF NOT EXISTS
FOR (t:Team) ON (t.status);
