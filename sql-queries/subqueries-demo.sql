USE rescuenet;

-- Zones with shelter count
SELECT 
    zone_id,
    name AS zone_name,
    severity,
    (SELECT COUNT(*) FROM shelters s WHERE s.zone_id = dz.zone_id) as shelter_count
FROM disaster_zones dz;

-- Zones with request count
SELECT 
    name AS zone_name,
    severity,
    (SELECT COUNT(*) FROM citizen_requests cr WHERE cr.zone_id = dz.zone_id) as request_count,
    (SELECT COUNT(*) FROM citizen_requests cr WHERE cr.zone_id = dz.zone_id AND cr.status = 'Pending') as pending_requests
FROM disaster_zones dz;

-- Zones with more than 1 shelter
SELECT 
    name AS zone_name,
    severity,
    status
FROM disaster_zones dz
WHERE (SELECT COUNT(*) FROM shelters s WHERE s.zone_id = dz.zone_id) > 1;

-- Shelters in Critical zones
SELECT 
    name AS shelter_name,
    capacity,
    current_occupancy
FROM shelters
WHERE zone_id IN (
    SELECT zone_id FROM disaster_zones WHERE severity = 'Critical'
);

-- Requests with priority higher than average
SELECT 
    reporter_name,
    description,
    priority
FROM citizen_requests
WHERE priority > (SELECT AVG(priority) FROM citizen_requests);


-- Average shelter capacity per zone
SELECT 
    zone_stats.zone_name,
    zone_stats.avg_capacity,
    zone_stats.shelter_count
FROM (
    SELECT 
        dz.name AS zone_name,
        AVG(s.capacity) as avg_capacity,
        COUNT(s.shelter_id) as shelter_count
    FROM disaster_zones dz
    LEFT JOIN shelters s ON dz.zone_id = s.zone_id
    GROUP BY dz.zone_id, dz.name
) as zone_stats
WHERE zone_stats.shelter_count > 0;

-- Zones with above-average number of requests
SELECT 
    dz.name AS zone_name,
    (SELECT COUNT(*) FROM citizen_requests cr WHERE cr.zone_id = dz.zone_id) as request_count
FROM disaster_zones dz
WHERE (
    SELECT COUNT(*) FROM citizen_requests cr WHERE cr.zone_id = dz.zone_id
) > (
    SELECT AVG(req_count) FROM (
        SELECT COUNT(*) as req_count 
        FROM citizen_requests 
        GROUP BY zone_id
    ) as avg_requests
);


-- Zones that have at least one shelter
SELECT 
    name AS zone_name,
    severity,
    status
FROM disaster_zones dz
WHERE EXISTS (
    SELECT 1 FROM shelters s WHERE s.zone_id = dz.zone_id
);

-- Zones that have pending requests
SELECT 
    name AS zone_name,
    severity
FROM disaster_zones dz
WHERE EXISTS (
    SELECT 1 FROM citizen_requests cr 
    WHERE cr.zone_id = dz.zone_id AND cr.status = 'Pending'
);

-- Zones without any shelters
SELECT 
    name AS zone_name,
    severity,
    status
FROM disaster_zones dz
WHERE NOT EXISTS (
    SELECT 1 FROM shelters s WHERE s.zone_id = dz.zone_id
);
