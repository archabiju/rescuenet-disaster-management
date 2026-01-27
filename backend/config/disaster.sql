PRAGMA foreign_keys = ON;
-- 1 Create tables

-- 1. USERS

CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    role TEXT CHECK (role IN ('Admin','Coordinator','Responder','Volunteer')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- 2. DISASTER ZONES

CREATE TABLE disaster_zones (
    zone_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    center_lat REAL NOT NULL,
    center_lng REAL NOT NULL,
    radius_meters INTEGER,
    severity INTEGER CHECK (severity BETWEEN 1 AND 5),
    declared_at DATETIME,
    status TEXT CHECK (status IN ('Active','Resolved','Monitoring')),
    type TEXT,
    type_of_help TEXT
);

-- 3. SHELTERS

CREATE TABLE shelters (
    shelter_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    lat REAL,
    lng REAL,
    capacity INTEGER CHECK (capacity >= 0),
    current_occupancy INTEGER DEFAULT 0,
    zone_id INTEGER,
    FOREIGN KEY (zone_id) REFERENCES disaster_zones(zone_id)
);

-- 4. RESOURCE CENTERS

CREATE TABLE resource_centers (
    center_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    lat REAL,
    lng REAL,
    address TEXT,
    contact_person TEXT,
    contact_phone TEXT
);

-- 5. RESOURCES

CREATE TABLE resources (
    resource_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT,
    critical_threshold INTEGER CHECK (critical_threshold >= 0)
);

-- 6. INVENTORIES

CREATE TABLE inventories (
    inventory_id INTEGER PRIMARY KEY,
    center_id INTEGER NOT NULL,
    resource_id INTEGER NOT NULL,
    quantity INTEGER CHECK (quantity >= 0),
    type TEXT,
    FOREIGN KEY (center_id) REFERENCES resource_centers(center_id),
    FOREIGN KEY (resource_id) REFERENCES resources(resource_id),
    UNIQUE (center_id, resource_id)
);


-- 7. RESCUE TEAMS

CREATE TABLE rescue_teams (
    team_id INTEGER PRIMARY KEY,
    team_name TEXT NOT NULL,
    lead_user_id INTEGER,
    status TEXT CHECK (status IN ('Available','Assigned','Inactive')),
    home_center_id INTEGER,
    phone_number TEXT,
    FOREIGN KEY (lead_user_id) REFERENCES users(user_id),
    FOREIGN KEY (home_center_id) REFERENCES resource_centers(center_id)
);


-- 8. TEAM MEMBERS

CREATE TABLE team_members (
    member_id INTEGER PRIMARY KEY,
    team_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (team_id) REFERENCES rescue_teams(team_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    UNIQUE (team_id, user_id)
);

-- 9. VEHICLES

CREATE TABLE vehicles (
    vehicle_id INTEGER PRIMARY KEY,
    vehicle_no TEXT UNIQUE NOT NULL,
    type TEXT,
    capacity INTEGER CHECK (capacity >= 0),
    current_center_id INTEGER,
    assigned_team_id INTEGER,
    FOREIGN KEY (current_center_id) REFERENCES resource_centers(center_id),
    FOREIGN KEY (assigned_team_id) REFERENCES rescue_teams(team_id)
);


-- 10. CITIZEN REQUESTS

CREATE TABLE citizen_requests (
    request_id INTEGER PRIMARY KEY,
    reporter_name TEXT NOT NULL,
    reporter_phone TEXT,
    description TEXT,
    lat REAL,
    lng REAL,
    zone_id INTEGER,
    priority INTEGER CHECK (priority BETWEEN 1 AND 5),
    status TEXT CHECK (status IN ('Pending','Assigned','Resolved')),
    FOREIGN KEY (zone_id) REFERENCES disaster_zones(zone_id)
);


-- 11. TEAM ASSIGNMENTS

CREATE TABLE team_assignments (
    assignment_id INTEGER PRIMARY KEY,
    team_id INTEGER NOT NULL,
    request_id INTEGER,
    zone_id INTEGER,
    assigned_by INTEGER,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES rescue_teams(team_id),
    FOREIGN KEY (request_id) REFERENCES citizen_requests(request_id),
    FOREIGN KEY (zone_id) REFERENCES disaster_zones(zone_id),
    FOREIGN KEY (assigned_by) REFERENCES users(user_id)
);
SELECT name FROM sqlite_master WHERE type='table';

