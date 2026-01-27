-- ============================================================
-- PL/SQL Triggers for RescueNet
-- Automated Database Operations
-- ============================================================

-- ============================================================
-- TRIGGER: Auto-update shelter occupancy log
-- Purpose: Log all changes to shelter occupancy for auditing
-- ============================================================
CREATE OR REPLACE FUNCTION log_shelter_occupancy_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.current_occupancy != NEW.current_occupancy THEN
        INSERT INTO audit_log (table_name, operation, record_id, old_data, new_data)
        VALUES (
            'shelters',
            'UPDATE',
            NEW.shelter_id,
            jsonb_build_object('current_occupancy', OLD.current_occupancy),
            jsonb_build_object('current_occupancy', NEW.current_occupancy)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_shelter_occupancy_change
AFTER UPDATE OF current_occupancy ON shelters
FOR EACH ROW
EXECUTE FUNCTION log_shelter_occupancy_change();

-- ============================================================
-- TRIGGER: Alert when inventory falls below critical threshold
-- Purpose: Insert alert when resource quantity drops below threshold
-- ============================================================
CREATE OR REPLACE FUNCTION check_inventory_threshold()
RETURNS TRIGGER AS $$
DECLARE
    v_threshold INTEGER;
    v_resource_name VARCHAR(100);
    v_center_name VARCHAR(100);
BEGIN
    -- Get threshold and names
    SELECT r.critical_threshold, r.name INTO v_threshold, v_resource_name
    FROM resources r
    WHERE r.resource_id = NEW.resource_id;
    
    SELECT name INTO v_center_name
    FROM resource_centers
    WHERE center_id = NEW.center_id;
    
    -- Check if below threshold
    IF NEW.quantity <= v_threshold AND (OLD.quantity IS NULL OR OLD.quantity > v_threshold) THEN
        INSERT INTO audit_log (table_name, operation, record_id, new_data)
        VALUES (
            'inventories',
            'ALERT',
            NEW.inventory_id,
            jsonb_build_object(
                'alert_type', 'CRITICAL_THRESHOLD',
                'message', 'Inventory below critical level',
                'resource_name', v_resource_name,
                'center_name', v_center_name,
                'current_quantity', NEW.quantity,
                'threshold', v_threshold
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_inventory_threshold_alert
AFTER INSERT OR UPDATE OF quantity ON inventories
FOR EACH ROW
EXECUTE FUNCTION check_inventory_threshold();

-- ============================================================
-- TRIGGER: Auto-update team member count
-- Purpose: Keep member_count in rescue_teams synchronized
-- ============================================================
CREATE OR REPLACE FUNCTION update_team_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE rescue_teams
        SET member_count = member_count + 1
        WHERE team_id = NEW.team_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE rescue_teams
        SET member_count = member_count - 1
        WHERE team_id = OLD.team_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_team_member_count
AFTER INSERT OR DELETE ON team_members
FOR EACH ROW
EXECUTE FUNCTION update_team_member_count();

-- ============================================================
-- TRIGGER: Validate shelter capacity before insert/update
-- Purpose: Ensure occupancy never exceeds capacity
-- ============================================================
CREATE OR REPLACE FUNCTION validate_shelter_capacity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.current_occupancy > NEW.capacity THEN
        RAISE EXCEPTION 'Occupancy (%) cannot exceed capacity (%)', NEW.current_occupancy, NEW.capacity;
    END IF;
    
    IF NEW.current_occupancy < 0 THEN
        RAISE EXCEPTION 'Occupancy cannot be negative';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_validate_shelter_capacity
BEFORE INSERT OR UPDATE ON shelters
FOR EACH ROW
EXECUTE FUNCTION validate_shelter_capacity();

-- ============================================================
-- TRIGGER: Auto-timestamp updates
-- Purpose: Automatically update 'updated_at' timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to users table
CREATE OR REPLACE TRIGGER trg_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Apply to disaster_zones table
CREATE OR REPLACE TRIGGER trg_zones_timestamp
BEFORE UPDATE ON disaster_zones
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ============================================================
-- TRIGGER: Log high-priority request creation
-- Purpose: Create audit entry for priority 5 (critical) requests
-- ============================================================
CREATE OR REPLACE FUNCTION log_critical_request()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.priority = 5 THEN
        INSERT INTO audit_log (table_name, operation, record_id, new_data)
        VALUES (
            'citizen_requests',
            'CRITICAL',
            NEW.request_id,
            jsonb_build_object(
                'alert_type', 'CRITICAL_REQUEST',
                'reporter_name', NEW.reporter_name,
                'description', NEW.description,
                'location', jsonb_build_object('lat', NEW.lat, 'lng', NEW.lng),
                'priority', NEW.priority
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_critical_request_alert
AFTER INSERT ON citizen_requests
FOR EACH ROW
EXECUTE FUNCTION log_critical_request();

-- ============================================================
-- TRIGGER: Prevent deletion of active zones
-- Purpose: Protect disaster zones that have active operations
-- ============================================================
CREATE OR REPLACE FUNCTION prevent_active_zone_deletion()
RETURNS TRIGGER AS $$
DECLARE
    v_pending_requests INTEGER;
    v_active_assignments INTEGER;
BEGIN
    -- Check for pending requests
    SELECT COUNT(*) INTO v_pending_requests
    FROM citizen_requests
    WHERE zone_id = OLD.zone_id AND status IN ('Pending', 'Assigned', 'In Progress');
    
    -- Check for active assignments
    SELECT COUNT(*) INTO v_active_assignments
    FROM team_assignments
    WHERE zone_id = OLD.zone_id AND completed_at IS NULL;
    
    IF v_pending_requests > 0 OR v_active_assignments > 0 THEN
        RAISE EXCEPTION 'Cannot delete zone with active operations. Pending requests: %, Active assignments: %',
            v_pending_requests, v_active_assignments;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_protect_active_zone
BEFORE DELETE ON disaster_zones
FOR EACH ROW
EXECUTE FUNCTION prevent_active_zone_deletion();
