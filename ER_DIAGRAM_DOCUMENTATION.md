# RescueNet - Entity-Relationship (ER) Diagram Documentation

## 📊 ER Diagram Overview

This document provides a comprehensive explanation of the RescueNet database schema, including all entities, relationships, cardinalities, and constraints.

---

## 🗂️ Entity Descriptions

### 1. **USERS** (User-Related - Light Blue)
**Purpose**: Stores all system users including admins, coordinators, responders, and volunteers.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| **user_id** | INTEGER | PRIMARY KEY | Unique identifier |
| full_name | VARCHAR(100) | NOT NULL | User's full name |
| email | VARCHAR(100) | UNIQUE | Email for authentication |
| phone | VARCHAR(20) | | Contact number |
| password_hash | VARCHAR(255) | | Hashed password |
| role | VARCHAR(20) | CHECK | Admin/Coordinator/Responder/Volunteer/User |
| created_at | TIMESTAMP | DEFAULT NOW | Account creation time |

**Relationships**:
- Leads rescue teams (1:N with RESCUE_TEAMS)
- Belongs to teams (1:N with TEAM_MEMBERS)
- Performs audit actions (1:N with AUDIT_LOG)
- Assigns teams (1:N with TEAM_ASSIGNMENTS)
- Allocates resources (1:N with RESOURCE_ALLOCATIONS)

---

### 2. **DISASTER_ZONES** (Location-Related - Light Green)
**Purpose**: Defines disaster-affected geographical areas.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| **zone_id** | INTEGER | PRIMARY KEY | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Zone name |
| center_lat | DECIMAL(10,8) | NOT NULL | Latitude of center |
| center_lng | DECIMAL(11,8) | NOT NULL | Longitude of center |
| radius_meters | INTEGER | | Affected radius |
| severity | INTEGER | CHECK (1-5) | Disaster severity level |
| status | VARCHAR(20) | CHECK | Active/Resolved/Monitoring |
| disaster_type | VARCHAR(50) | | Flood/Earthquake/Cyclone/etc. |
| description | TEXT | | Detailed description |

**Relationships**:
- Contains shelters (1:N with SHELTERS)
- Has citizen requests (1:N with CITIZEN_REQUESTS)
- Receives resource allocations (1:N with RESOURCE_ALLOCATIONS)
- Has team assignments (1:N with TEAM_ASSIGNMENTS)

---

### 3. **SHELTERS** (Location-Related - Light Green)
**Purpose**: Emergency shelter facilities for displaced people.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| **shelter_id** | INTEGER | PRIMARY KEY | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Shelter name |
| address | TEXT | | Physical address |
| lat | DECIMAL(10,8) | | Latitude |
| lng | DECIMAL(11,8) | | Longitude |
| capacity | INTEGER | CHECK (>=0) | Maximum capacity |
| current_occupancy | INTEGER | DEFAULT 0 | Current occupants |
| zone_id | INTEGER | FOREIGN KEY | Associated disaster zone |
| contact_phone | VARCHAR(20) | | Contact number |

**Relationships**:
- Located in disaster zone (N:1 with DISASTER_ZONES)

**Business Rule**: current_occupancy ≤ capacity (enforced by trigger)

---

### 4. **RESOURCE_CENTERS** (Resource-Related - Light Yellow)
**Purpose**: Warehouses storing emergency supplies.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| **center_id** | INTEGER | PRIMARY KEY | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Center name |
| lat | DECIMAL(10,8) | | Latitude |
| lng | DECIMAL(11,8) | | Longitude |
| address | TEXT | | Physical address |
| contact_person | VARCHAR(100) | | Manager name |
| contact_phone | VARCHAR(20) | | Contact number |

**Relationships**:
- Stores inventories (1:N with INVENTORIES)
- Supplies allocations (1:N with RESOURCE_ALLOCATIONS)
- Houses vehicles (1:N with VEHICLES)
- Base for rescue teams (1:N with RESCUE_TEAMS)

---

### 5. **RESOURCES** (Resource-Related - Light Yellow)
**Purpose**: Catalog of resource types (food, water, medical supplies, etc.).

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| **resource_id** | INTEGER | PRIMARY KEY | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Resource name |
| unit | VARCHAR(20) | | Unit of measurement |
| critical_threshold | INTEGER | CHECK (>=0) | Minimum stock level |
| category | VARCHAR(50) | | Medical/Food/Equipment/etc. |

**Relationships**:
- Tracked in inventories (1:N with INVENTORIES)
- Allocated in distributions (1:N with RESOURCE_ALLOCATIONS)

---

### 6. **INVENTORIES** (Resource-Related - Light Yellow)
**Purpose**: Current stock levels at each resource center.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| **inventory_id** | INTEGER | PRIMARY KEY | Unique identifier |
| center_id | INTEGER | FOREIGN KEY, NOT NULL | Resource center |
| resource_id | INTEGER | FOREIGN KEY, NOT NULL | Resource type |
| quantity | INTEGER | CHECK (>=0) | Current stock |
| inventory_type | VARCHAR(50) | | Classification |
| last_updated | TIMESTAMP | DEFAULT NOW | Last update time |

**Relationships**:
- Stored at resource center (N:1 with RESOURCE_CENTERS)
- Tracks resource type (N:1 with RESOURCES)

**Unique Constraint**: (center_id, resource_id) - one inventory record per resource per center

**Business Rule**: Alert when quantity < critical_threshold (enforced by trigger)

---

### 7. **RESCUE_TEAMS** (User-Related - Light Blue)
**Purpose**: Organized rescue and response teams.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| **team_id** | INTEGER | PRIMARY KEY | Unique identifier |
| team_name | VARCHAR(100) | NOT NULL | Team name |
| lead_user_id | INTEGER | FOREIGN KEY | Team leader |
| status | VARCHAR(20) | CHECK | Available/Assigned/Inactive |
| home_center_id | INTEGER | FOREIGN KEY | Base location |
| phone_number | VARCHAR(20) | | Contact number |
| specialization | VARCHAR(100) | | Medical/Search&Rescue/etc. |
| member_count | INTEGER | DEFAULT 0 | Number of members |

**Relationships**:
- Led by user (N:1 with USERS)
- Has members (1:N with TEAM_MEMBERS)
- Based at center (N:1 with RESOURCE_CENTERS)
- Has assignments (1:N with TEAM_ASSIGNMENTS)
- Has vehicles (1:N with VEHICLES)

**Business Rule**: member_count auto-updated by trigger when members added/removed

---

### 8. **TEAM_MEMBERS** (User-Related - Light Blue)
**Purpose**: Many-to-many relationship between users and teams.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| **member_id** | INTEGER | PRIMARY KEY | Unique identifier |
| team_id | INTEGER | FOREIGN KEY, NOT NULL | Team |
| user_id | INTEGER | FOREIGN KEY, NOT NULL | User |
| joined_at | TIMESTAMP | DEFAULT NOW | Join date |

**Relationships**:
- Belongs to team (N:1 with RESCUE_TEAMS)
- Is a user (N:1 with USERS)

**Unique Constraint**: (team_id, user_id) - user can't join same team twice

---

### 9. **VEHICLES** (Resource-Related - Light Yellow)
**Purpose**: Fleet of emergency vehicles (ambulances, trucks, etc.).

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| **vehicle_id** | INTEGER | PRIMARY KEY | Unique identifier |
| vehicle_no | VARCHAR(20) | UNIQUE, NOT NULL | License plate |
| vehicle_type | VARCHAR(50) | | Ambulance/Truck/etc. |
| capacity | INTEGER | CHECK (>=0) | Passenger/cargo capacity |
| current_center_id | INTEGER | FOREIGN KEY | Current location |
| assigned_team_id | INTEGER | FOREIGN KEY | Assigned team |
| status | VARCHAR(20) | CHECK | Available/InUse/Maintenance |

**Relationships**:
- Located at center (N:1 with RESOURCE_CENTERS)
- Assigned to team (N:1 with RESCUE_TEAMS)

---

### 10. **CITIZEN_REQUESTS** (Assignment/Tracking - Light Orange)
**Purpose**: Emergency help requests from citizens.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| **request_id** | INTEGER | PRIMARY KEY | Unique identifier |
| reporter_name | VARCHAR(100) | NOT NULL | Requester name |
| reporter_phone | VARCHAR(20) | | Contact number |
| description | TEXT | | Request details |
| lat | DECIMAL(10,8) | | Location latitude |
| lng | DECIMAL(11,8) | | Location longitude |
| zone_id | INTEGER | FOREIGN KEY | Disaster zone |
| priority | INTEGER | CHECK (1-5) | Urgency level |
| status | VARCHAR(20) | CHECK | Pending/Assigned/InProgress/Resolved |
| request_type | VARCHAR(50) | | Rescue/Medical/Food/Shelter |
| created_at | TIMESTAMP | DEFAULT NOW | Request time |
| resolved_at | TIMESTAMP | | Resolution time |

**Relationships**:
- In disaster zone (N:1 with DISASTER_ZONES)
- Gets team assignment (1:1 with TEAM_ASSIGNMENTS)

---

### 11. **TEAM_ASSIGNMENTS** (Assignment/Tracking - Light Orange)
**Purpose**: Assigns rescue teams to requests or zones.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| **assignment_id** | INTEGER | PRIMARY KEY | Unique identifier |
| team_id | INTEGER | FOREIGN KEY, NOT NULL | Assigned team |
| request_id | INTEGER | FOREIGN KEY | Citizen request |
| zone_id | INTEGER | FOREIGN KEY | Disaster zone |
| assigned_by | INTEGER | FOREIGN KEY | Admin who assigned |
| assigned_at | TIMESTAMP | DEFAULT NOW | Assignment time |
| completed_at | TIMESTAMP | | Completion time |
| notes | TEXT | | Additional notes |

**Relationships**:
- Assigns team (N:1 with RESCUE_TEAMS)
- For request (1:1 with CITIZEN_REQUESTS)
- In zone (N:1 with DISASTER_ZONES)
- Created by user (N:1 with USERS)

**Business Rule**: Updates team and request status automatically (via PL/SQL procedure)

---

### 12. **RESOURCE_ALLOCATIONS** (Assignment/Tracking - Light Orange)
**Purpose**: Tracks resource distribution from centers to zones.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| **allocation_id** | INTEGER | PRIMARY KEY | Unique identifier |
| from_center_id | INTEGER | FOREIGN KEY | Source center |
| to_zone_id | INTEGER | FOREIGN KEY | Destination zone |
| resource_id | INTEGER | FOREIGN KEY | Resource type |
| quantity | INTEGER | CHECK (>0) | Amount allocated |
| allocated_by | INTEGER | FOREIGN KEY | Admin who allocated |
| allocated_at | TIMESTAMP | DEFAULT NOW | Allocation time |
| status | VARCHAR(20) | CHECK | Pending/InTransit/Delivered |

**Relationships**:
- From center (N:1 with RESOURCE_CENTERS)
- To zone (N:1 with DISASTER_ZONES)
- Of resource (N:1 with RESOURCES)
- By user (N:1 with USERS)

**Business Rule**: Deducts from inventory automatically (via PL/SQL procedure)

---

### 13. **AUDIT_LOG** (Assignment/Tracking - Light Orange)
**Purpose**: Tracks all database changes for accountability.

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| **log_id** | INTEGER | PRIMARY KEY | Unique identifier |
| table_name | VARCHAR(50) | NOT NULL | Affected table |
| operation | VARCHAR(10) | NOT NULL | INSERT/UPDATE/DELETE |
| record_id | INTEGER | | Affected record ID |
| old_data | JSONB | | Previous values |
| new_data | JSONB | | New values |
| performed_by | INTEGER | FOREIGN KEY | User who performed |
| performed_at | TIMESTAMP | DEFAULT NOW | Action time |

**Relationships**:
- Performed by user (N:1 with USERS)

**Business Rule**: Auto-populated by triggers on critical tables

---

## 🔗 Relationship Summary

### Cardinality Legend:
- **1** : Exactly one
- **N** : Many (zero or more)
- **1..N** : One or more
- **0..1** : Zero or one (optional)

### Complete Relationship List:

| Relationship | Entity 1 | Cardinality | Entity 2 | Type |
|--------------|----------|-------------|----------|------|
| leads | USERS | 1 | RESCUE_TEAMS | 1:N |
| belongs_to | USERS | 1 | TEAM_MEMBERS | 1:N |
| has_members | RESCUE_TEAMS | 1 | TEAM_MEMBERS | 1:N |
| based_at | RESCUE_TEAMS | N | RESOURCE_CENTERS | N:1 |
| assigned_to | RESCUE_TEAMS | 1 | TEAM_ASSIGNMENTS | 1:N |
| contains | DISASTER_ZONES | 1 | SHELTERS | 1:N |
| has_requests | DISASTER_ZONES | 1 | CITIZEN_REQUESTS | 1:N |
| receives | DISASTER_ZONES | 1 | RESOURCE_ALLOCATIONS | 1:N |
| has_assignments | DISASTER_ZONES | 1 | TEAM_ASSIGNMENTS | 1:N |
| stores | RESOURCE_CENTERS | 1 | INVENTORIES | 1:N |
| supplies | RESOURCE_CENTERS | 1 | RESOURCE_ALLOCATIONS | 1:N |
| houses | RESOURCE_CENTERS | 1 | VEHICLES | 1:N |
| tracked_in | RESOURCES | 1 | INVENTORIES | 1:N |
| allocated_in | RESOURCES | 1 | RESOURCE_ALLOCATIONS | 1:N |
| gets_assignment | CITIZEN_REQUESTS | 1 | TEAM_ASSIGNMENTS | 1:1 |
| assigned_vehicle | VEHICLES | N | RESCUE_TEAMS | N:1 |
| performs | USERS | 1 | AUDIT_LOG | 1:N |
| assigns_team | USERS | 1 | TEAM_ASSIGNMENTS | 1:N |
| allocates | USERS | 1 | RESOURCE_ALLOCATIONS | 1:N |

---

## 🎨 Color Coding

### Entity Groups:
1. **User-Related (Light Blue)**:
   - USERS
   - RESCUE_TEAMS
   - TEAM_MEMBERS

2. **Location-Related (Light Green)**:
   - DISASTER_ZONES
   - SHELTERS

3. **Resource-Related (Light Yellow)**:
   - RESOURCE_CENTERS
   - RESOURCES
   - INVENTORIES
   - VEHICLES

4. **Assignment/Tracking (Light Orange)**:
   - CITIZEN_REQUESTS
   - TEAM_ASSIGNMENTS
   - RESOURCE_ALLOCATIONS
   - AUDIT_LOG

---

## 📐 Cardinality Notation (Crow's Foot)

```
1  ──────  Exactly one (mandatory)
0..1 ──o── Zero or one (optional)
N  ──<──  Many (zero or more)
1..N ──<── One or more (mandatory many)
```

### Examples:
- **USERS ──1── leads ──N── RESCUE_TEAMS**: One user leads many teams (but each team has one leader)
- **DISASTER_ZONES ──1── contains ──N── SHELTERS**: One zone contains many shelters
- **CITIZEN_REQUESTS ──1── gets ──1── TEAM_ASSIGNMENTS**: One request gets exactly one assignment

---

## 🔐 Constraints & Business Rules

### Primary Key Constraints:
All entities have a SERIAL PRIMARY KEY (auto-incrementing integer).

### Foreign Key Constraints:
- **ON DELETE CASCADE**: team_members, inventories (delete children when parent deleted)
- **ON DELETE SET NULL**: Most relationships (preserve history when parent deleted)

### Check Constraints:
- **severity**: 1-5 range
- **priority**: 1-5 range
- **capacity**: >= 0
- **quantity**: >= 0 (inventories), > 0 (allocations)
- **status**: Enumerated values (Active/Resolved/etc.)
- **role**: Enumerated values (Admin/Coordinator/etc.)

### Unique Constraints:
- **users.email**: No duplicate emails
- **vehicles.vehicle_no**: No duplicate license plates
- **inventories(center_id, resource_id)**: One inventory per resource per center
- **team_members(team_id, user_id)**: User can't join same team twice

### Triggers (Auto-Actions):
1. **update_team_member_count**: Auto-update member_count when members added/removed
2. **check_inventory_threshold**: Alert when stock below critical level
3. **validate_shelter_capacity**: Prevent over-booking shelters
4. **audit_log_trigger**: Auto-log changes to critical tables

### PL/SQL Procedures:
1. **assign_team_to_request()**: Validates and assigns teams, updates statuses
2. **allocate_resources()**: Checks inventory, deducts stock, creates allocation
3. **resolve_request()**: Marks request as resolved, updates timestamps
4. **get_zone_statistics()**: Calculates zone-level statistics
5. **get_available_capacity()**: Computes available shelter space
6. **get_team_workload()**: Analyzes team assignments

---

## 📊 ER Diagram Best Practices Applied

### 1. **Normalization**:
- All entities in 3NF (Third Normal Form)
- No transitive dependencies
- No partial dependencies
- Minimal data redundancy

### 2. **Referential Integrity**:
- All foreign keys properly defined
- Appropriate ON DELETE actions
- Cascade where children meaningless without parent
- SET NULL where history should be preserved

### 3. **Data Integrity**:
- CHECK constraints for valid ranges
- UNIQUE constraints for business keys
- NOT NULL for mandatory fields
- DEFAULT values for timestamps

### 4. **Performance Optimization**:
- Indexes on foreign keys
- Indexes on frequently queried fields (status, priority)
- Composite unique indexes where needed

### 5. **Audit Trail**:
- created_at timestamps on all entities
- updated_at where applicable
- Comprehensive audit_log table
- JSONB for flexible old/new data storage

---

## 🎯 Use Cases Supported

### 1. **Disaster Reporting**:
- Citizens report disasters → CITIZEN_REQUESTS
- Admin creates zones → DISASTER_ZONES
- System tracks severity and status

### 2. **Team Management**:
- Create teams → RESCUE_TEAMS
- Assign members → TEAM_MEMBERS
- Track team leader → USERS.lead_user_id

### 3. **Resource Management**:
- Define resources → RESOURCES
- Track inventory → INVENTORIES
- Allocate to zones → RESOURCE_ALLOCATIONS
- Alert on low stock → triggers

### 4. **Assignment Workflow**:
- Request comes in → CITIZEN_REQUESTS
- Admin assigns team → TEAM_ASSIGNMENTS (via PL/SQL)
- Team status auto-updated
- Request status auto-updated

### 5. **Shelter Management**:
- Define shelters → SHELTERS
- Track capacity → capacity, current_occupancy
- Prevent over-booking → triggers

### 6. **Vehicle Tracking**:
- Register vehicles → VEHICLES
- Assign to teams → assigned_team_id
- Track location → current_center_id

### 7. **Audit & Compliance**:
- All actions logged → AUDIT_LOG
- Who did what, when
- Old vs new values stored

---

## 📝 Notes for Presentation

### Key Points to Emphasize:
1. **Comprehensive Schema**: 13 entities covering all aspects of disaster management
2. **Proper Relationships**: 19 relationships with correct cardinalities
3. **Data Integrity**: Extensive use of constraints and triggers
4. **Business Logic**: PL/SQL procedures for complex operations
5. **Audit Trail**: Complete logging for accountability
6. **Normalization**: Properly normalized to 3NF
7. **Performance**: Strategic indexing for query optimization

### Diagram Features:
- ✅ Crow's foot notation for cardinalities
- ✅ Color-coded entity groups
- ✅ Primary keys underlined
- ✅ Foreign keys in italics
- ✅ Relationship diamonds labeled
- ✅ Clean, professional layout
- ✅ Minimal line crossings
- ✅ Hierarchical organization

---

**This ER diagram represents a production-ready, academically sound database design for a comprehensive disaster management system.**
