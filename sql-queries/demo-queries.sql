USE rescuenet;
-- 1.1 Users
SELECT * FROM users;

-- 1.2 Disaster Zones
SELECT * FROM disaster_zones;

-- 1.3 Shelters
SELECT * FROM shelters;

-- 1.4 Resource Centers
SELECT * FROM resource_centers;

-- 1.5 Resources
SELECT * FROM resources;

-- 1.6 Inventories
SELECT * FROM inventories;

-- 1.7 Rescue Teams
SELECT * FROM rescue_teams;

-- 1.8 Team Members
SELECT * FROM team_members;

-- 1.9 Vehicles
SELECT * FROM vehicles;

-- 1.10 Citizen Requests
SELECT * FROM citizen_requests;

-- 1.11 Team Assignments
SELECT * FROM team_assignments;



-- 2.1 Shelters with Zone Details
SELECT 
    s.shelter_id,
    s.name AS shelter_name,
    s.capacity,
    s.current_occupancy,
    dz.name AS zone_name,
    dz.severity,
    dz.type AS disaster_type
FROM shelters s
JOIN disaster_zones dz ON s.zone_id = dz.zone_id;

-- 2.2 Inventories with Resource and Center Details
SELECT 
    rc.name AS center_name,
    r.name AS resource_name,
    i.quantity,
    r.unit,
    r.critical_threshold,
    CASE WHEN i.quantity < r.critical_threshold THEN 'LOW STOCK!' ELSE 'OK' END AS stock_status
FROM inventories i
JOIN resource_centers rc ON i.center_id = rc.center_id
JOIN resources r ON i.resource_id = r.resource_id;

-- 2.3 Rescue Teams with Leader Info
SELECT 
    rt.team_id,
    rt.team_name,
    u.full_name AS team_leader,
    rt.status,
    rc.name AS home_center
FROM rescue_teams rt
LEFT JOIN users u ON rt.lead_user_id = u.user_id
LEFT JOIN resource_centers rc ON rt.home_center_id = rc.center_id;

-- 2.4 Team Members with User Details
SELECT 
    rt.team_name,
    u.full_name AS member_name,
    u.email,
    u.role
FROM team_members tm
JOIN rescue_teams rt ON tm.team_id = rt.team_id
JOIN users u ON tm.user_id = u.user_id;

-- 2.5 Vehicles with Team and Center Info
SELECT 
    v.vehicle_no,
    v.type,
    v.capacity,
    rt.team_name AS assigned_to,
    rc.name AS current_location
FROM vehicles v
LEFT JOIN rescue_teams rt ON v.assigned_team_id = rt.team_id
LEFT JOIN resource_centers rc ON v.current_center_id = rc.center_id;

-- 2.6 Citizen Requests with Zone Info
SELECT 
    cr.request_id,
    cr.reporter_name,
    cr.description,
    cr.priority,
    cr.status,
    dz.name AS zone_name,
    dz.severity
FROM citizen_requests cr
LEFT JOIN disaster_zones dz ON cr.zone_id = dz.zone_id
ORDER BY cr.priority DESC;

-- 2.7 Team Assignments (Complete View)
SELECT 
    ta.assignment_id,
    rt.team_name,
    cr.reporter_name AS request_from,
    cr.description AS request_desc,
    dz.name AS zone_name,
    u.full_name AS assigned_by,
    ta.assigned_at
FROM team_assignments ta
JOIN rescue_teams rt ON ta.team_id = rt.team_id
LEFT JOIN citizen_requests cr ON ta.request_id = cr.request_id
LEFT JOIN disaster_zones dz ON ta.zone_id = dz.zone_id
LEFT JOIN users u ON ta.assigned_by = u.user_id;



-- 3.1 Table Statistics
SELECT 
    (SELECT COUNT(*) FROM users) AS users,
    (SELECT COUNT(*) FROM disaster_zones) AS zones,
    (SELECT COUNT(*) FROM shelters) AS shelters,
    (SELECT COUNT(*) FROM resource_centers) AS centers,
    (SELECT COUNT(*) FROM resources) AS resources,
    (SELECT COUNT(*) FROM inventories) AS inventories,
    (SELECT COUNT(*) FROM rescue_teams) AS teams,
    (SELECT COUNT(*) FROM vehicles) AS vehicles,
    (SELECT COUNT(*) FROM citizen_requests) AS requests;

-- 3.2 Zones by Severity Count
SELECT 
    severity,
    COUNT(*) AS zone_count
FROM disaster_zones
GROUP BY severity
ORDER BY FIELD(severity, 'Critical', 'High', 'Medium', 'Low');

-- 3.3 Requests by Status
SELECT 
    status,
    COUNT(*) AS request_count,
    ROUND(AVG(priority), 1) AS avg_priority
FROM citizen_requests
GROUP BY status;

-- 3.4 Shelter Capacity Summary
SELECT 
    SUM(capacity) AS total_capacity,
    SUM(current_occupancy) AS total_occupied,
    SUM(capacity - current_occupancy) AS available_space,
    ROUND(SUM(current_occupancy) * 100.0 / SUM(capacity), 1) AS occupancy_percent
FROM shelters;

-- 3.5 Inventory Summary by Resource
SELECT 
    r.name AS resource_name,
    SUM(i.quantity) AS total_quantity,
    r.unit,
    r.critical_threshold,
    CASE 
        WHEN SUM(i.quantity) < r.critical_threshold THEN 'CRITICAL'
        WHEN SUM(i.quantity) < r.critical_threshold * 2 THEN 'LOW'
        ELSE 'ADEQUATE'
    END AS status
FROM resources r
LEFT JOIN inventories i ON r.resource_id = i.resource_id
GROUP BY r.resource_id, r.name, r.unit, r.critical_threshold;

-- 3.6 Team Performance (Members + Assignments)
SELECT 
    rt.team_name,
    rt.status,
    (SELECT COUNT(*) FROM team_members WHERE team_id = rt.team_id) AS member_count,
    (SELECT COUNT(*) FROM team_assignments WHERE team_id = rt.team_id) AS assignments
FROM rescue_teams rt;

-- 4.1 Zones with most pending requests
SELECT 
    name,
    severity,
    (SELECT COUNT(*) FROM citizen_requests cr WHERE cr.zone_id = dz.zone_id AND cr.status = 'Pending') AS pending_requests
FROM disaster_zones dz
ORDER BY pending_requests DESC;

-- 4.2 Centers with low stock resources
SELECT DISTINCT
    rc.name AS center_name,
    rc.contact_person,
    rc.contact_phone
FROM resource_centers rc
WHERE rc.center_id IN (
    SELECT i.center_id 
    FROM inventories i
    JOIN resources r ON i.resource_id = r.resource_id
    WHERE i.quantity < r.critical_threshold
);

-- 4.3 Users who are team leaders
SELECT * FROM users
WHERE user_id IN (
    SELECT DISTINCT lead_user_id FROM rescue_teams WHERE lead_user_id IS NOT NULL
);


-- 5.1 Complete Zone Overview
SELECT 
    dz.zone_id,
    dz.name AS zone_name,
    dz.severity,
    dz.status,
    dz.type,
    (SELECT COUNT(*) FROM shelters WHERE zone_id = dz.zone_id) AS shelter_count,
    (SELECT COALESCE(SUM(capacity), 0) FROM shelters WHERE zone_id = dz.zone_id) AS total_shelter_capacity,
    (SELECT COUNT(*) FROM citizen_requests WHERE zone_id = dz.zone_id) AS request_count,
    (SELECT COUNT(*) FROM citizen_requests WHERE zone_id = dz.zone_id AND status = 'Pending') AS pending_requests,
    (SELECT COUNT(*) FROM team_assignments WHERE zone_id = dz.zone_id) AS teams_assigned
FROM disaster_zones dz
ORDER BY FIELD(dz.severity, 'Critical', 'High', 'Medium', 'Low');

-- 5.2 Resource Center Inventory Report
SELECT 
    rc.center_id,
    rc.name AS center_name,
    rc.contact_person,
    COUNT(DISTINCT i.resource_id) AS resource_types,
    SUM(i.quantity) AS total_items,
    (SELECT COUNT(*) FROM rescue_teams WHERE home_center_id = rc.center_id) AS teams_based_here,
    (SELECT COUNT(*) FROM vehicles WHERE current_center_id = rc.center_id) AS vehicles_here
FROM resource_centers rc
LEFT JOIN inventories i ON rc.center_id = i.center_id
GROUP BY rc.center_id, rc.name, rc.contact_person;

-- 5.3 Team Deployment Status
SELECT 
    rt.team_id,
    rt.team_name,
    rt.status AS team_status,
    u.full_name AS leader,
    (SELECT COUNT(*) FROM team_members WHERE team_id = rt.team_id) AS members,
    (SELECT COUNT(*) FROM vehicles WHERE assigned_team_id = rt.team_id) AS vehicles,
    (SELECT COUNT(*) FROM team_assignments WHERE team_id = rt.team_id) AS active_assignments
FROM rescue_teams rt
LEFT JOIN users u ON rt.lead_user_id = u.user_id;

