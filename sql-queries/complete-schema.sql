
CREATE DATABASE IF NOT EXISTS rescuenet;
USE rescuenet;


DROP TABLE IF EXISTS team_assignments;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS citizen_requests;
DROP TABLE IF EXISTS inventories;
DROP TABLE IF EXISTS rescue_teams;
DROP TABLE IF EXISTS shelters;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS resource_centers;
DROP TABLE IF EXISTS disaster_zones;
DROP TABLE IF EXISTS users;


-- TABLE 1: users

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'responder', 'citizen') DEFAULT 'citizen',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- TABLE 2: disaster_zones

CREATE TABLE disaster_zones (
    zone_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    center_lat DECIMAL(10, 8),
    center_lng DECIMAL(11, 8),
    radius_meters INT DEFAULT 1000,
    severity ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    declared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Active', 'Monitoring', 'Resolved') DEFAULT 'Active',
    type VARCHAR(50),
    type_of_help VARCHAR(100)
);

-- TABLE 3: shelters

CREATE TABLE shelters (
    shelter_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    capacity INT DEFAULT 100,
    current_occupancy INT DEFAULT 0,
    zone_id INT,
    FOREIGN KEY (zone_id) REFERENCES disaster_zones(zone_id) ON DELETE SET NULL
);

-- TABLE 4: resource_centers

CREATE TABLE resource_centers (
    center_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    address VARCHAR(255),
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20)
);

-- TABLE 5: resources

CREATE TABLE resources (
    resource_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(50) DEFAULT 'units',
    critical_threshold INT DEFAULT 10
);

-- TABLE 6: inventories

CREATE TABLE inventories (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    center_id INT NOT NULL,
    resource_id INT NOT NULL,
    quantity INT DEFAULT 0,
    type VARCHAR(50),
    FOREIGN KEY (center_id) REFERENCES resource_centers(center_id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(resource_id) ON DELETE CASCADE
);


-- TABLE 7: rescue_teams

CREATE TABLE rescue_teams (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    lead_user_id INT,
    status ENUM('Available', 'Deployed', 'On Break', 'Inactive') DEFAULT 'Available',
    home_center_id INT,
    phone_number VARCHAR(20),
    FOREIGN KEY (lead_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (home_center_id) REFERENCES resource_centers(center_id) ON DELETE SET NULL
);


-- TABLE 8: team_members

CREATE TABLE team_members (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    UNIQUE KEY unique_team_user (team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES rescue_teams(team_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


-- TABLE 9: vehicles

CREATE TABLE vehicles (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_no VARCHAR(20) UNIQUE NOT NULL,
    type VARCHAR(50),
    capacity INT DEFAULT 4,
    current_center_id INT,
    assigned_team_id INT,
    FOREIGN KEY (current_center_id) REFERENCES resource_centers(center_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_team_id) REFERENCES rescue_teams(team_id) ON DELETE SET NULL
);


-- TABLE 10: citizen_requests

CREATE TABLE citizen_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_name VARCHAR(100),
    reporter_phone VARCHAR(20),
    description TEXT,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    zone_id INT,
    priority INT DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    status ENUM('Pending', 'In Progress', 'Resolved', 'Cancelled') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES disaster_zones(zone_id) ON DELETE SET NULL
);

-- TABLE 11: team_assignments

CREATE TABLE team_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    request_id INT,
    zone_id INT,
    assigned_by INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES rescue_teams(team_id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES citizen_requests(request_id) ON DELETE CASCADE,
    FOREIGN KEY (zone_id) REFERENCES disaster_zones(zone_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE SET NULL
);


CREATE TABLE disaster_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_name VARCHAR(100),
    reporter_phone VARCHAR(20),
    reporter_id INT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    disaster_type ENUM('flood', 'earthquake', 'cyclone', 'landslide', 'fire', 'other'),
    description TEXT,
    severity_estimate ENUM('low', 'medium', 'high', 'critical'),
    zone_id INT,
    status ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES disaster_zones(zone_id) ON DELETE SET NULL,
    FOREIGN KEY (reporter_id) REFERENCES users(user_id) ON DELETE SET NULL
);


CREATE TABLE resource_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    requester_name VARCHAR(100),
    requester_phone VARCHAR(20),
    requester_id INT,
    resource_type VARCHAR(100),
    quantity INT,
    urgency ENUM('low', 'medium', 'high', 'critical'),
    location VARCHAR(255),
    description TEXT,
    status ENUM('Pending', 'Approved', 'Fulfilled', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(user_id) ON DELETE SET NULL
);




USE rescuenet;

-- Create the table
CREATE TABLE IF NOT EXISTS disaster_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_name VARCHAR(100) NOT NULL,
    reporter_phone VARCHAR(20),
    reporter_id INT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    disaster_type ENUM('flood', 'earthquake', 'cyclone', 'landslide', 'fire', 'other') DEFAULT 'other',
    description TEXT,
    severity_estimate ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    zone_id INT,
    status ENUM('Pending', 'Verified', 'Rejected', 'Resolved') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES disaster_zones(zone_id) ON DELETE SET NULL
);

-- Add sample data
INSERT IGNORE INTO disaster_reports (reporter_name, reporter_phone, location_lat, location_lng, disaster_type, description, severity_estimate, zone_id, status) VALUES
('Ravi Kumar', '9876543001', 12.9716, 77.5946, 'flood', 'Heavy flooding in residential area, water level rising', 'high', 1, 'Pending'),
('Priya Sharma', '9876543002', 13.0827, 80.2707, 'earthquake', 'Buildings shaking, cracks appearing in walls', 'critical', 2, 'Verified'),
('Anil Menon', '9876543003', 11.0168, 76.9558, 'landslide', 'Road blocked by landslide debris', 'medium', 3, 'Pending');

-- Verify
SELECT * FROM disaster_reports;


-- INSERT SAMPLE DATA


-- Sample Users
INSERT IGNORE INTO users (full_name, email, phone, role) VALUES
('Admin User', 'admin@rescuenet.com', '9876543210', 'admin'),
('John Responder', 'john@rescuenet.com', '9876543211', 'responder'),
('Jane Citizen', 'jane@rescuenet.com', '9876543212', 'citizen'),
('Mike Volunteer', 'mike@rescuenet.com', '9876543213', 'responder'),
('Sarah Williams', 'sarah@rescuenet.com', '9876543214', 'responder'),
('Bob Kumar', 'bob@rescuenet.com', '9876543215', 'citizen'),
('Nandhana Reddy', 'nandhana@rescuenet.com', '9876543216', 'citizen');

-- Sample Disaster Zones
INSERT IGNORE INTO disaster_zones (name, center_lat, center_lng, radius_meters, severity, status, type, type_of_help) VALUES
('Flood Zone Alpha', 12.9716, 77.5946, 2000, 'High', 'Active', 'Flood', 'Evacuation, Food, Medical'),
('Earthquake Zone Beta', 13.0827, 80.2707, 5000, 'Critical', 'Active', 'Earthquake', 'Search & Rescue, Medical'),
('Landslide Zone Gamma', 11.0168, 76.9558, 1500, 'Medium', 'Monitoring', 'Landslide', 'Evacuation'),
('Fire Zone Delta', 12.2958, 76.6394, 1000, 'High', 'Active', 'Fire', 'Firefighting, Medical');

-- Sample Shelters
INSERT IGNORE INTO shelters (name, address, lat, lng, capacity, current_occupancy, zone_id) VALUES
('Central Emergency Shelter', '123 Main Road, City Center', 12.9750, 77.5900, 200, 150, 1),
('North Relief Camp', '45 North Avenue', 12.9800, 77.5950, 150, 80, 1),
('Community Hall Shelter', '67 South Street', 13.0850, 80.2750, 300, 200, 2),
('School Shelter', '89 School Road', 11.0200, 76.9600, 100, 45, 3);

-- Sample Resource Centers
INSERT IGNORE INTO resource_centers (name, lat, lng, address, contact_person, contact_phone) VALUES
('Main Supply Hub', 12.9650, 77.5850, '100 Supply Road, Warehouse District', 'Raj Kumar', '9800000001'),
('North Medical Center', 13.0900, 80.2800, '200 Hospital Road', 'Dr. Priya', '9800000002'),
('East Distribution Center', 11.0100, 77.0000, '300 East Highway', 'Anil Singh', '9800000003');

-- Sample Resources
INSERT IGNORE INTO resources (name, unit, critical_threshold) VALUES
('Drinking Water', 'liters', 500),
('Medical Kits', 'units', 50),
('Blankets', 'units', 100),
('Food Packets', 'packets', 200),
('Tents', 'units', 20),
('Generators', 'units', 5),
('First Aid Kits', 'units', 100);

-- Sample Inventories
INSERT IGNORE INTO inventories (center_id, resource_id, quantity, type) VALUES
(1, 1, 5000, 'Emergency'),
(1, 2, 200, 'Medical'),
(1, 3, 500, 'Shelter'),
(1, 4, 1000, 'Food'),
(2, 1, 2000, 'Emergency'),
(2, 2, 500, 'Medical'),
(2, 5, 50, 'Shelter'),
(3, 3, 300, 'Shelter'),
(3, 4, 800, 'Food');

-- Sample Rescue Teams
INSERT IGNORE INTO rescue_teams (team_name, lead_user_id, status, home_center_id, phone_number) VALUES
('Alpha Response Team', 2, 'Available', 1, '9700000001'),
('Beta Medical Team', 4, 'Deployed', 2, '9700000002'),
('Gamma Search Team', 5, 'Available', 1, '9700000003');

-- Sample Team Members
INSERT IGNORE INTO team_members (team_id, user_id) VALUES
(1, 2),
(1, 4),
(2, 4),
(2, 5),
(3, 5),
(3, 2);

-- Sample Vehicles
INSERT IGNORE INTO vehicles (vehicle_no, type, capacity, current_center_id, assigned_team_id) VALUES
('KA01AB1234', 'Ambulance', 4, 1, 1),
('KA02CD5678', 'Rescue Truck', 8, 2, 2),
('KA03EF9012', 'Mobile Unit', 6, 1, 3),
('KA04GH3456', 'Supply Van', 10, 3, NULL);

-- Sample Citizen Requests
INSERT IGNORE INTO citizen_requests (reporter_name, reporter_phone, description, lat, lng, zone_id, priority, status) VALUES
('Alice Johnson', '9600000001', 'Need food supplies urgently for 10 people', 12.9720, 77.5950, 1, 5, 'Pending'),
('Bob Smith', '9600000002', 'Medical assistance required for elderly', 13.0830, 80.2710, 2, 5, 'In Progress'),
('Carol White', '9600000003', 'Shelter space needed for family of 5', 12.9780, 77.5920, 1, 3, 'Pending'),
('David Brown', '9600000004', 'Water supply shortage in our area', 11.0170, 76.9560, 3, 4, 'Resolved'),
('Emma Wilson', '9600000005', 'Trapped on rooftop, need rescue', 12.9730, 77.5940, 1, 5, 'In Progress'),
('Nandhana Reddy', '9600000006', 'Landslide blocking road, need help', 11.0180, 76.9570, 3, 4, 'Pending');

-- Sample Team Assignments
INSERT IGNORE INTO team_assignments (team_id, request_id, zone_id, assigned_by) VALUES
(1, 5, 1, 1),
(2, 2, 2, 1),
(3, 1, 1, 1);

-- ============================================================
-- VERIFY ALL TABLES CREATED
-- ============================================================
SHOW TABLES;

-- Show table counts
SELECT 'users' AS table_name, COUNT(*) AS rows_count FROM users
UNION ALL
SELECT 'disaster_zones', COUNT(*) FROM disaster_zones
UNION ALL
SELECT 'shelters', COUNT(*) FROM shelters
UNION ALL
SELECT 'resource_centers', COUNT(*) FROM resource_centers
UNION ALL
SELECT 'resources', COUNT(*) FROM resources
UNION ALL
SELECT 'inventories', COUNT(*) FROM inventories
UNION ALL
SELECT 'rescue_teams', COUNT(*) FROM rescue_teams
UNION ALL
SELECT 'team_members', COUNT(*) FROM team_members
UNION ALL
SELECT 'vehicles', COUNT(*) FROM vehicles
UNION ALL
SELECT 'citizen_requests', COUNT(*) FROM citizen_requests
UNION ALL
SELECT 'team_assignments', COUNT(*) FROM team_assignments;
