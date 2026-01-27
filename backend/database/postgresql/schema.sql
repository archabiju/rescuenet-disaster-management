-- ============================================================
-- PostgreSQL Schema for RescueNet Disaster Management System
-- ============================================================
-- This schema converts the SQLite schema to PostgreSQL with
-- enhanced features for transactional data management.
-- ============================================================

-- Enable UUID extension if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255),
    role VARCHAR(20) CHECK (role IN ('Admin', 'Coordinator', 'Responder', 'Volunteer', 'User')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email lookups (authentication)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================
-- 2. DISASTER ZONES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS disaster_zones (
    zone_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    center_lat DECIMAL(10, 8) NOT NULL,
    center_lng DECIMAL(11, 8) NOT NULL,
    radius_meters INTEGER,
    severity INTEGER CHECK (severity BETWEEN 1 AND 5),
    declared_at TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('Active', 'Resolved', 'Monitoring')),
    disaster_type VARCHAR(50),
    type_of_help TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_zones_status ON disaster_zones(status);
CREATE INDEX IF NOT EXISTS idx_zones_severity ON disaster_zones(severity);

-- ============================================================
-- 3. SHELTERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS shelters (
    shelter_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    capacity INTEGER CHECK (capacity >= 0),
    current_occupancy INTEGER DEFAULT 0,
    zone_id INTEGER REFERENCES disaster_zones(zone_id) ON DELETE SET NULL,
    contact_phone VARCHAR(20),
    amenities TEXT[], -- PostgreSQL array for amenities
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. RESOURCE CENTERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS resource_centers (
    center_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    address TEXT,
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. RESOURCES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS resources (
    resource_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20),
    critical_threshold INTEGER CHECK (critical_threshold >= 0),
    category VARCHAR(50), -- 'Medical', 'Food', 'Equipment', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 6. INVENTORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS inventories (
    inventory_id SERIAL PRIMARY KEY,
    center_id INTEGER NOT NULL REFERENCES resource_centers(center_id) ON DELETE CASCADE,
    resource_id INTEGER NOT NULL REFERENCES resources(resource_id) ON DELETE CASCADE,
    quantity INTEGER CHECK (quantity >= 0),
    inventory_type VARCHAR(50),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (center_id, resource_id)
);

-- Index for quick inventory lookups
CREATE INDEX IF NOT EXISTS idx_inventory_center ON inventories(center_id);
CREATE INDEX IF NOT EXISTS idx_inventory_resource ON inventories(resource_id);

-- ============================================================
-- 7. RESCUE TEAMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS rescue_teams (
    team_id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    lead_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    status VARCHAR(20) CHECK (status IN ('Available', 'Assigned', 'Inactive')),
    home_center_id INTEGER REFERENCES resource_centers(center_id) ON DELETE SET NULL,
    phone_number VARCHAR(20),
    specialization VARCHAR(100), -- 'Medical', 'Search & Rescue', 'Logistics', etc.
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 8. TEAM MEMBERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS team_members (
    member_id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES rescue_teams(team_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (team_id, user_id)
);

-- ============================================================
-- 9. VEHICLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id SERIAL PRIMARY KEY,
    vehicle_no VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50),
    capacity INTEGER CHECK (capacity >= 0),
    current_center_id INTEGER REFERENCES resource_centers(center_id) ON DELETE SET NULL,
    assigned_team_id INTEGER REFERENCES rescue_teams(team_id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'In Use', 'Maintenance')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 10. CITIZEN REQUESTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS citizen_requests (
    request_id SERIAL PRIMARY KEY,
    reporter_name VARCHAR(100) NOT NULL,
    reporter_phone VARCHAR(20),
    description TEXT,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    zone_id INTEGER REFERENCES disaster_zones(zone_id) ON DELETE SET NULL,
    priority INTEGER CHECK (priority BETWEEN 1 AND 5),
    status VARCHAR(20) CHECK (status IN ('Pending', 'Assigned', 'In Progress', 'Resolved')),
    request_type VARCHAR(50), -- 'Rescue', 'Medical', 'Food', 'Shelter', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_requests_status ON citizen_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON citizen_requests(priority DESC);

-- ============================================================
-- 11. TEAM ASSIGNMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS team_assignments (
    assignment_id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES rescue_teams(team_id) ON DELETE CASCADE,
    request_id INTEGER REFERENCES citizen_requests(request_id) ON DELETE SET NULL,
    zone_id INTEGER REFERENCES disaster_zones(zone_id) ON DELETE SET NULL,
    assigned_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT
);

-- ============================================================
-- 12. AUDIT LOG TABLE (for PL/SQL demonstration)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
    log_id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    record_id INTEGER,
    old_data JSONB,
    new_data JSONB,
    performed_by INTEGER REFERENCES users(user_id),
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 13. RESOURCE ALLOCATIONS TABLE (for tracking distributions)
-- ============================================================
CREATE TABLE IF NOT EXISTS resource_allocations (
    allocation_id SERIAL PRIMARY KEY,
    from_center_id INTEGER REFERENCES resource_centers(center_id),
    to_zone_id INTEGER REFERENCES disaster_zones(zone_id),
    resource_id INTEGER REFERENCES resources(resource_id),
    quantity INTEGER CHECK (quantity > 0),
    allocated_by INTEGER REFERENCES users(user_id),
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Transit', 'Delivered'))
);

-- ============================================================
-- Grant permissions (adjust as needed)
-- ============================================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_username;
