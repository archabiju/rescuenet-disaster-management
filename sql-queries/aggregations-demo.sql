USE rescuenet;

-- Total count of each table
SELECT 'users' as table_name, COUNT(*) as total FROM users
UNION ALL
SELECT 'disaster_zones', COUNT(*) FROM disaster_zones
UNION ALL
SELECT 'shelters', COUNT(*) FROM shelters
UNION ALL
SELECT 'citizen_requests', COUNT(*) FROM citizen_requests;

-- Count requests by status
SELECT 
    status,
    COUNT(*) as total_requests
FROM citizen_requests
GROUP BY status;

-- Count zones by severity
SELECT 
    severity,
    COUNT(*) as zone_count
FROM disaster_zones
GROUP BY severity
ORDER BY zone_count DESC;



-- Total shelter capacity
SELECT 
    SUM(capacity) as total_capacity,
    SUM(current_occupancy) as total_occupied,
    SUM(capacity - current_occupancy) as total_available
FROM shelters;

-- Shelter capacity by zone
SELECT 
    dz.name AS zone_name,
    dz.severity,
    SUM(s.capacity) as total_capacity,
    SUM(s.current_occupancy) as total_occupied
FROM shelters s
JOIN disaster_zones dz ON s.zone_id = dz.zone_id
GROUP BY dz.zone_id, dz.name, dz.severity;



-- Average priority of requests
SELECT 
    ROUND(AVG(priority), 2) as avg_priority
FROM citizen_requests;

-- Average priority by zone
SELECT 
    dz.name AS zone_name,
    ROUND(AVG(cr.priority), 2) as avg_priority,
    COUNT(cr.request_id) as request_count
FROM disaster_zones dz
LEFT JOIN citizen_requests cr ON dz.zone_id = cr.zone_id
GROUP BY dz.zone_id, dz.name;

-- Average shelter occupancy
SELECT 
    ROUND(AVG(current_occupancy), 0) as avg_occupancy,
    ROUND(AVG(capacity), 0) as avg_capacity,
    ROUND(AVG(current_occupancy * 100.0 / capacity), 1) as avg_occupancy_percent
FROM shelters;


SELECT 
    MAX(priority) as highest_priority,
    MIN(priority) as lowest_priority
FROM citizen_requests;

-- Largest and smallest shelters
SELECT 
    MAX(capacity) as largest_shelter,
    MIN(capacity) as smallest_shelter
FROM shelters;



-- Zones with more than 1 shelter
SELECT 
    dz.name AS zone_name,
    COUNT(s.shelter_id) as shelter_count
FROM disaster_zones dz
LEFT JOIN shelters s ON dz.zone_id = s.zone_id
GROUP BY dz.zone_id, dz.name
HAVING COUNT(s.shelter_id) > 0;

-- Zones with high average priority requests
SELECT 
    dz.name AS zone_name,
    ROUND(AVG(cr.priority), 2) as avg_priority,
    COUNT(cr.request_id) as request_count
FROM disaster_zones dz
JOIN citizen_requests cr ON dz.zone_id = cr.zone_id
GROUP BY dz.zone_id, dz.name
HAVING AVG(cr.priority) >= 3;



-- Complete dashboard statistics
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM disaster_zones WHERE status = 'Active') as active_zones,
    (SELECT COUNT(*) FROM citizen_requests WHERE status = 'Pending') as pending_requests,
    (SELECT SUM(capacity - current_occupancy) FROM shelters) as available_shelter_space,
    (SELECT ROUND(AVG(priority), 2) FROM citizen_requests) as avg_request_priority;
