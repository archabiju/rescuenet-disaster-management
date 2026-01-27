-- ============================================================
-- PostgreSQL Seed Data for RescueNet
-- Sample data matching the SQLite insert.sql
-- ============================================================

-- ============================================================
-- 1. INSERT USERS
-- ============================================================
INSERT INTO users (user_id, full_name, email, phone, password_hash, role) VALUES
(1, 'Admin User', 'admin@gmail.com', '9999999999', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Admin'),
(2, 'Ravi Kumar', 'ravi@gmail.com', '8888888888', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Coordinator'),
(3, 'Anita Sharma', 'anita@gmail.com', '7777777777', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Responder'),
(4, 'Rahul Das', 'rahul@gmail.com', '6666666666', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Volunteer'),
(5, 'Neha Verma', 'neha@gmail.com', '9555555555', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Responder'),
(6, 'Amit Singh', 'amit@gmail.com', '9444444444', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Volunteer'),
(7, 'Priya Menon', 'priya@gmail.com', '9333333333', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Coordinator')
ON CONFLICT (email) DO NOTHING;

-- Reset sequence
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));

-- ============================================================
-- 2. INSERT DISASTER ZONES
-- ============================================================
INSERT INTO disaster_zones (zone_id, name, center_lat, center_lng, radius_meters, severity, declared_at, status, disaster_type, type_of_help, description) VALUES
(1, 'Chennai Flood Zone', 13.0827, 80.2707, 5000, 4, CURRENT_TIMESTAMP, 'Active', 'Flood', 'Rescue, Food', 'Heavy flooding in central Chennai area'),
(2, 'Kerala Landslide Area', 10.8505, 76.2711, 3000, 5, CURRENT_TIMESTAMP, 'Active', 'Landslide', 'Medical', 'Severe landslide in Wayanad district'),
(3, 'Odisha Cyclone Zone', 20.9517, 85.0985, 6000, 5, CURRENT_TIMESTAMP, 'Active', 'Cyclone', 'Evacuation', 'Cyclone Fani affected coastal areas'),
(4, 'Assam Flood Area', 26.2006, 92.9376, 4000, 4, CURRENT_TIMESTAMP, 'Active', 'Flood', 'Food, Shelter', 'Annual monsoon flooding in Brahmaputra basin')
ON CONFLICT DO NOTHING;

SELECT setval('disaster_zones_zone_id_seq', (SELECT MAX(zone_id) FROM disaster_zones));

-- ============================================================
-- 3. INSERT SHELTERS
-- ============================================================
INSERT INTO shelters (shelter_id, name, address, lat, lng, capacity, current_occupancy, zone_id, contact_phone, amenities, is_active) VALUES
(1, 'Chennai Central Shelter', 'Central Chennai', 13.08, 80.27, 500, 120, 1, '044-12345678', ARRAY['Food', 'Water', 'Medical', 'Beds'], TRUE),
(2, 'Kerala Relief Camp', 'Wayanad', 11.68, 76.13, 300, 80, 2, '0471-2345678', ARRAY['Food', 'Water', 'Medical'], TRUE),
(3, 'Odisha Emergency Camp', 'Bhubaneswar', 20.95, 85.09, 400, 150, 3, '0674-3456789', ARRAY['Food', 'Water', 'Temporary Shelter'], TRUE),
(4, 'Assam Relief Center', 'Guwahati', 26.20, 92.93, 350, 100, 4, '0361-4567890', ARRAY['Food', 'Water', 'Medical', 'Childcare'], TRUE)
ON CONFLICT DO NOTHING;

SELECT setval('shelters_shelter_id_seq', (SELECT MAX(shelter_id) FROM shelters));

-- ============================================================
-- 4. INSERT RESOURCE CENTERS
-- ============================================================
INSERT INTO resource_centers (center_id, name, lat, lng, address, contact_person, contact_phone, is_active) VALUES
(1, 'Chennai Warehouse', 13.09, 80.28, 'Chennai', 'Suresh Kumar', '9991112222', TRUE),
(2, 'Kochi Warehouse', 9.93, 76.26, 'Kochi', 'Mahesh Nair', '8882223333', TRUE),
(3, 'Odisha Supply Hub', 20.96, 85.10, 'Bhubaneswar', 'Ramesh Mohanty', '9777777777', TRUE),
(4, 'Assam Central Store', 26.21, 92.94, 'Guwahati', 'Anil Bora', '9666666666', TRUE)
ON CONFLICT DO NOTHING;

SELECT setval('resource_centers_center_id_seq', (SELECT MAX(center_id) FROM resource_centers));

-- ============================================================
-- 5. INSERT RESOURCES
-- ============================================================
INSERT INTO resources (resource_id, name, unit, critical_threshold, category) VALUES
(1, 'Drinking Water', 'Liters', 100, 'Essential'),
(2, 'Medical Kit', 'Units', 50, 'Medical'),
(3, 'Blankets', 'Units', 200, 'Relief'),
(4, 'Rice Bags', 'Kg', 500, 'Food'),
(5, 'Baby Food', 'Packs', 100, 'Nutrition'),
(6, 'Tarpaulins', 'Units', 50, 'Shelter'),
(7, 'First Aid Kits', 'Units', 100, 'Medical'),
(8, 'Torches', 'Units', 50, 'Equipment')
ON CONFLICT DO NOTHING;

SELECT setval('resources_resource_id_seq', (SELECT MAX(resource_id) FROM resources));

-- ============================================================
-- 6. INSERT INVENTORIES
-- ============================================================
INSERT INTO inventories (inventory_id, center_id, resource_id, quantity, inventory_type) VALUES
(1, 1, 1, 500, 'Emergency'),
(2, 1, 2, 200, 'Medical'),
(3, 2, 3, 300, 'Relief'),
(4, 3, 4, 1000, 'Relief'),
(5, 3, 1, 800, 'Emergency'),
(6, 4, 5, 150, 'Nutrition'),
(7, 1, 6, 100, 'Shelter'),
(8, 2, 7, 75, 'Medical')
ON CONFLICT (center_id, resource_id) DO NOTHING;

SELECT setval('inventories_inventory_id_seq', (SELECT MAX(inventory_id) FROM inventories));

-- ============================================================
-- 7. INSERT RESCUE TEAMS
-- ============================================================
INSERT INTO rescue_teams (team_id, team_name, lead_user_id, status, home_center_id, phone_number, specialization, member_count) VALUES
(1, 'Alpha Team', 3, 'Available', 1, '9000000001', 'Search & Rescue', 2),
(2, 'Bravo Team', 4, 'Assigned', 2, '9000000002', 'Medical Support', 1),
(3, 'Charlie Team', 5, 'Available', 3, '9000000003', 'Logistics', 2),
(4, 'Delta Team', 6, 'Available', 4, '9000000004', 'Evacuation', 1)
ON CONFLICT DO NOTHING;

SELECT setval('rescue_teams_team_id_seq', (SELECT MAX(team_id) FROM rescue_teams));

-- ============================================================
-- 8. INSERT TEAM MEMBERS
-- ============================================================
INSERT INTO team_members (member_id, team_id, user_id) VALUES
(1, 1, 3),
(2, 1, 4),
(3, 2, 4),
(4, 3, 5),
(5, 3, 6),
(6, 4, 7)
ON CONFLICT (team_id, user_id) DO NOTHING;

SELECT setval('team_members_member_id_seq', (SELECT MAX(member_id) FROM team_members));

-- ============================================================
-- 9. INSERT VEHICLES
-- ============================================================
INSERT INTO vehicles (vehicle_id, vehicle_no, vehicle_type, capacity, current_center_id, assigned_team_id, status) VALUES
(1, 'TN01AB1234', 'Ambulance', 4, 1, 1, 'Available'),
(2, 'KL07CD5678', 'Truck', 20, 2, 2, 'In Use'),
(3, 'OD02EF9999', 'Boat', 15, 3, 3, 'Available'),
(4, 'AS01GH1111', 'Truck', 25, 4, 4, 'Available')
ON CONFLICT (vehicle_no) DO NOTHING;

SELECT setval('vehicles_vehicle_id_seq', (SELECT MAX(vehicle_id) FROM vehicles));

-- ============================================================
-- 10. INSERT CITIZEN REQUESTS
-- ============================================================
INSERT INTO citizen_requests (request_id, reporter_name, reporter_phone, description, lat, lng, zone_id, priority, status, request_type) VALUES
(1, 'Suresh', '9876543210', 'Need food and water urgently', 13.07, 80.26, 1, 3, 'Pending', 'Food'),
(2, 'Meena', '9123456780', 'Medical emergency - elderly person needs help', 10.85, 76.27, 2, 5, 'Assigned', 'Medical'),
(3, 'Rajan', '9001112233', 'Evacuation needed - water rising fast', 20.95, 85.10, 3, 5, 'Pending', 'Rescue'),
(4, 'Lakshmi', '9112223344', 'Family of 5 needs shelter', 26.20, 92.94, 4, 4, 'Pending', 'Shelter')
ON CONFLICT DO NOTHING;

SELECT setval('citizen_requests_request_id_seq', (SELECT MAX(request_id) FROM citizen_requests));

-- ============================================================
-- 11. INSERT TEAM ASSIGNMENTS
-- ============================================================
INSERT INTO team_assignments (assignment_id, team_id, request_id, zone_id, assigned_by) VALUES
(1, 1, 1, 1, 2),
(2, 2, 2, 2, 1),
(3, 3, 3, 3, 7),
(4, 4, 4, 4, 5)
ON CONFLICT DO NOTHING;

SELECT setval('team_assignments_assignment_id_seq', (SELECT MAX(assignment_id) FROM team_assignments));

-- ============================================================
-- Verify data
-- ============================================================
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'Disaster Zones', COUNT(*) FROM disaster_zones
UNION ALL SELECT 'Shelters', COUNT(*) FROM shelters
UNION ALL SELECT 'Resource Centers', COUNT(*) FROM resource_centers
UNION ALL SELECT 'Resources', COUNT(*) FROM resources
UNION ALL SELECT 'Inventories', COUNT(*) FROM inventories
UNION ALL SELECT 'Rescue Teams', COUNT(*) FROM rescue_teams
UNION ALL SELECT 'Team Members', COUNT(*) FROM team_members
UNION ALL SELECT 'Vehicles', COUNT(*) FROM vehicles
UNION ALL SELECT 'Citizen Requests', COUNT(*) FROM citizen_requests
UNION ALL SELECT 'Team Assignments', COUNT(*) FROM team_assignments;
