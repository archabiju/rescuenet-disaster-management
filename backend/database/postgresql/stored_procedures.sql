-- ============================================================
-- PL/SQL Stored Procedures for RescueNet
-- Business Logic & Automation
-- ============================================================

-- ============================================================
-- PROCEDURE: assign_team_to_request
-- Purpose: Assigns a rescue team to a citizen request with
--          validation and automatic status updates
-- ============================================================
CREATE OR REPLACE FUNCTION assign_team_to_request(
    p_request_id INTEGER,
    p_team_id INTEGER,
    p_assigned_by INTEGER
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    assignment_id INTEGER
) AS $$
DECLARE
    v_team_status VARCHAR(20);
    v_request_status VARCHAR(20);
    v_new_assignment_id INTEGER;
    v_zone_id INTEGER;
BEGIN
    -- Check if team exists and is available
    SELECT status INTO v_team_status
    FROM rescue_teams
    WHERE team_id = p_team_id;
    
    IF v_team_status IS NULL THEN
        RETURN QUERY SELECT FALSE, 'Team not found'::TEXT, NULL::INTEGER;
        RETURN;
    END IF;
    
    IF v_team_status != 'Available' THEN
        RETURN QUERY SELECT FALSE, ('Team is not available. Current status: ' || v_team_status)::TEXT, NULL::INTEGER;
        RETURN;
    END IF;
    
    -- Check if request exists and is pending
    SELECT status, zone_id INTO v_request_status, v_zone_id
    FROM citizen_requests
    WHERE request_id = p_request_id;
    
    IF v_request_status IS NULL THEN
        RETURN QUERY SELECT FALSE, 'Request not found'::TEXT, NULL::INTEGER;
        RETURN;
    END IF;
    
    IF v_request_status != 'Pending' THEN
        RETURN QUERY SELECT FALSE, ('Request is already ' || v_request_status)::TEXT, NULL::INTEGER;
        RETURN;
    END IF;
    
    -- Create assignment
    INSERT INTO team_assignments (team_id, request_id, zone_id, assigned_by)
    VALUES (p_team_id, p_request_id, v_zone_id, p_assigned_by)
    RETURNING assignment_id INTO v_new_assignment_id;
    
    -- Update team status to Assigned
    UPDATE rescue_teams
    SET status = 'Assigned'
    WHERE team_id = p_team_id;
    
    -- Update request status to Assigned
    UPDATE citizen_requests
    SET status = 'Assigned'
    WHERE request_id = p_request_id;
    
    RETURN QUERY SELECT TRUE, 'Team successfully assigned to request'::TEXT, v_new_assignment_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PROCEDURE: allocate_resources
-- Purpose: Allocates resources from a center to a disaster zone
--          with inventory validation and automatic deduction
-- ============================================================
CREATE OR REPLACE FUNCTION allocate_resources(
    p_center_id INTEGER,
    p_zone_id INTEGER,
    p_resource_id INTEGER,
    p_quantity INTEGER,
    p_allocated_by INTEGER
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    remaining_quantity INTEGER
) AS $$
DECLARE
    v_current_quantity INTEGER;
    v_critical_threshold INTEGER;
    v_new_quantity INTEGER;
BEGIN
    -- Check current inventory
    SELECT i.quantity, r.critical_threshold 
    INTO v_current_quantity, v_critical_threshold
    FROM inventories i
    JOIN resources r ON i.resource_id = r.resource_id
    WHERE i.center_id = p_center_id AND i.resource_id = p_resource_id;
    
    IF v_current_quantity IS NULL THEN
        RETURN QUERY SELECT FALSE, 'Resource not found in this center'::TEXT, NULL::INTEGER;
        RETURN;
    END IF;
    
    IF v_current_quantity < p_quantity THEN
        RETURN QUERY SELECT FALSE, ('Insufficient inventory. Available: ' || v_current_quantity)::TEXT, v_current_quantity;
        RETURN;
    END IF;
    
    -- Deduct from inventory
    v_new_quantity := v_current_quantity - p_quantity;
    
    UPDATE inventories
    SET quantity = v_new_quantity,
        last_updated = CURRENT_TIMESTAMP
    WHERE center_id = p_center_id AND resource_id = p_resource_id;
    
    -- Create allocation record
    INSERT INTO resource_allocations (from_center_id, to_zone_id, resource_id, quantity, allocated_by)
    VALUES (p_center_id, p_zone_id, p_resource_id, p_quantity, p_allocated_by);
    
    -- Check if below critical threshold and return warning
    IF v_new_quantity <= v_critical_threshold THEN
        RETURN QUERY SELECT TRUE, ('⚠️ WARNING: Inventory below critical threshold! Remaining: ' || v_new_quantity)::TEXT, v_new_quantity;
    ELSE
        RETURN QUERY SELECT TRUE, ('Resources allocated successfully. Remaining: ' || v_new_quantity)::TEXT, v_new_quantity;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: get_available_capacity
-- Purpose: Calculate total available shelter capacity in a zone
-- ============================================================
CREATE OR REPLACE FUNCTION get_available_capacity(p_zone_id INTEGER)
RETURNS TABLE(
    total_capacity INTEGER,
    total_occupied INTEGER,
    available_capacity INTEGER,
    occupancy_percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(s.capacity), 0)::INTEGER AS total_capacity,
        COALESCE(SUM(s.current_occupancy), 0)::INTEGER AS total_occupied,
        COALESCE(SUM(s.capacity - s.current_occupancy), 0)::INTEGER AS available_capacity,
        CASE 
            WHEN COALESCE(SUM(s.capacity), 0) = 0 THEN 0
            ELSE ROUND((COALESCE(SUM(s.current_occupancy), 0)::DECIMAL / COALESCE(SUM(s.capacity), 1) * 100), 2)
        END AS occupancy_percentage
    FROM shelters s
    WHERE s.zone_id = p_zone_id AND s.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: calculate_resource_deficit
-- Purpose: Calculate resource shortages for a zone based on
--          active requests and available inventory
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_resource_deficit(p_zone_id INTEGER)
RETURNS TABLE(
    resource_name VARCHAR(100),
    required_quantity INTEGER,
    available_quantity INTEGER,
    deficit INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.name AS resource_name,
        COUNT(cr.request_id)::INTEGER * 10 AS required_quantity, -- Estimate 10 units per request
        COALESCE(SUM(i.quantity), 0)::INTEGER AS available_quantity,
        GREATEST(COUNT(cr.request_id)::INTEGER * 10 - COALESCE(SUM(i.quantity), 0)::INTEGER, 0) AS deficit
    FROM resources r
    CROSS JOIN citizen_requests cr
    LEFT JOIN inventories i ON r.resource_id = i.resource_id
    LEFT JOIN resource_centers rc ON i.center_id = rc.center_id
    WHERE cr.zone_id = p_zone_id AND cr.status IN ('Pending', 'Assigned')
    GROUP BY r.resource_id, r.name
    HAVING COUNT(cr.request_id)::INTEGER * 10 > COALESCE(SUM(i.quantity), 0)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: get_team_workload
-- Purpose: Get workload statistics for all rescue teams
-- ============================================================
CREATE OR REPLACE FUNCTION get_team_workload()
RETURNS TABLE(
    team_id INTEGER,
    team_name VARCHAR(100),
    status VARCHAR(20),
    active_assignments INTEGER,
    completed_assignments INTEGER,
    avg_completion_time_hours DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rt.team_id,
        rt.team_name,
        rt.status,
        COUNT(CASE WHEN ta.completed_at IS NULL THEN 1 END)::INTEGER AS active_assignments,
        COUNT(CASE WHEN ta.completed_at IS NOT NULL THEN 1 END)::INTEGER AS completed_assignments,
        COALESCE(
            AVG(EXTRACT(EPOCH FROM (ta.completed_at - ta.assigned_at)) / 3600)::DECIMAL(10,2),
            0
        ) AS avg_completion_time_hours
    FROM rescue_teams rt
    LEFT JOIN team_assignments ta ON rt.team_id = ta.team_id
    GROUP BY rt.team_id, rt.team_name, rt.status
    ORDER BY active_assignments DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PROCEDURE: resolve_request
-- Purpose: Mark a request as resolved and free up the assigned team
-- ============================================================
CREATE OR REPLACE FUNCTION resolve_request(
    p_request_id INTEGER,
    p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_team_id INTEGER;
BEGIN
    -- Get the assigned team
    SELECT team_id INTO v_team_id
    FROM team_assignments
    WHERE request_id = p_request_id AND completed_at IS NULL;
    
    -- Update request status
    UPDATE citizen_requests
    SET status = 'Resolved',
        resolved_at = CURRENT_TIMESTAMP
    WHERE request_id = p_request_id;
    
    -- Mark assignment as completed
    UPDATE team_assignments
    SET completed_at = CURRENT_TIMESTAMP,
        notes = p_notes
    WHERE request_id = p_request_id AND completed_at IS NULL;
    
    -- Make team available again
    IF v_team_id IS NOT NULL THEN
        UPDATE rescue_teams
        SET status = 'Available'
        WHERE team_id = v_team_id;
    END IF;
    
    RETURN QUERY SELECT TRUE, 'Request resolved successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: get_zone_statistics
-- Purpose: Get comprehensive statistics for a disaster zone
-- ============================================================
CREATE OR REPLACE FUNCTION get_zone_statistics(p_zone_id INTEGER)
RETURNS TABLE(
    zone_name VARCHAR(100),
    severity INTEGER,
    status VARCHAR(20),
    total_shelters INTEGER,
    total_capacity INTEGER,
    current_occupancy INTEGER,
    pending_requests INTEGER,
    assigned_teams INTEGER,
    total_resources INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dz.name AS zone_name,
        dz.severity,
        dz.status,
        (SELECT COUNT(*)::INTEGER FROM shelters WHERE zone_id = p_zone_id),
        (SELECT COALESCE(SUM(capacity), 0)::INTEGER FROM shelters WHERE zone_id = p_zone_id),
        (SELECT COALESCE(SUM(current_occupancy), 0)::INTEGER FROM shelters WHERE zone_id = p_zone_id),
        (SELECT COUNT(*)::INTEGER FROM citizen_requests WHERE zone_id = p_zone_id AND status = 'Pending'),
        (SELECT COUNT(DISTINCT ta.team_id)::INTEGER FROM team_assignments ta WHERE ta.zone_id = p_zone_id AND ta.completed_at IS NULL),
        (SELECT COALESCE(SUM(ra.quantity), 0)::INTEGER FROM resource_allocations ra WHERE ra.to_zone_id = p_zone_id)
    FROM disaster_zones dz
    WHERE dz.zone_id = p_zone_id;
END;
$$ LANGUAGE plpgsql;
