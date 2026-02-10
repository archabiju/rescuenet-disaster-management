
USE rescuenet;


-- Shelters with their zone information
SELECT 
    s.shelter_id,
    s.name AS shelter_name,
    s.capacity,
    s.current_occupancy,
    dz.name AS zone_name,
    dz.severity,
    dz.status
FROM shelters s
INNER JOIN disaster_zones dz ON s.zone_id = dz.zone_id;

-- Citizen requests with zone details
SELECT 
    cr.request_id,
    cr.reporter_name,
    cr.description,
    cr.priority,
    cr.status,
    dz.name AS zone_name,
    dz.severity
FROM citizen_requests cr
INNER JOIN disaster_zones dz ON cr.zone_id = dz.zone_id
ORDER BY cr.priority DESC;


-- All zones with their shelters (even zones without shelters)
SELECT 
    dz.zone_id,
    dz.name AS zone_name,
    dz.severity,
    s.name AS shelter_name,
    s.capacity
FROM disaster_zones dz
LEFT JOIN shelters s ON dz.zone_id = s.zone_id;

-- All zones with their requests (even zones without requests)
SELECT 
    dz.name AS zone_name,
    dz.severity,
    cr.reporter_name,
    cr.description,
    cr.status
FROM disaster_zones dz
LEFT JOIN citizen_requests cr ON dz.zone_id = cr.zone_id;



-- Complete view: Requests → Zones → Shelters
SELECT 
    cr.request_id,
    cr.reporter_name,
    cr.description,
    cr.priority,
    cr.status as request_status,
    dz.name AS zone_name,
    dz.severity,
    s.name AS shelter_name,
    s.capacity,
    s.current_occupancy,
    (s.capacity - s.current_occupancy) as available_space
FROM citizen_requests cr
INNER JOIN disaster_zones dz ON cr.zone_id = dz.zone_id
LEFT JOIN shelters s ON dz.zone_id = s.zone_id
ORDER BY cr.priority DESC, dz.severity;



-- Query to explain JOIN relationships for reviewer
SELECT 
    '--- ZONES TABLE ---' as section,
    zone_id, name AS zone_name, severity, status
FROM disaster_zones

UNION ALL

SELECT 
    '--- LINKED SHELTERS ---' as section,
    s.shelter_id, s.name, CONCAT(s.capacity, ' capacity'), dz.name
FROM shelters s
JOIN disaster_zones dz ON s.zone_id = dz.zone_id;
