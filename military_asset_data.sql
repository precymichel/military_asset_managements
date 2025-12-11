-- ===========================================
-- MILITARY ASSET MANAGEMENT SYSTEM SQL SETUP
-- DATABASE NAME: military_asset
-- ===========================================

DROP TABLE IF EXISTS api_logs CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS transfers CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    base TEXT
);

INSERT INTO users (username, password, role, base) VALUES
('admin', 'adminpass', 'admin', NULL),
('cmd_alfa', 'commanderpass', 'base_commander', 'Base Alpha'),
('log_beta', 'logipass', 'logistics_officer', 'Base Beta');

-- ASSETS TABLE
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    equipment_type TEXT,
    base TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO assets (name, equipment_type, base, quantity) VALUES
('Truck A', 'vehicle', 'Base Alpha', 10),
('Rifle X', 'weapon', 'Base Beta', 200),
('Ammo 5.56', 'ammunition', 'Base Beta', 5000);

-- PURCHASES TABLE
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    purchased_at TIMESTAMP DEFAULT NOW(),
    description TEXT
);

INSERT INTO purchases (asset_id, quantity, description)
VALUES (1, 2, 'New trucks delivered');

-- TRANSFERS TABLE
CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
    from_base TEXT,
    to_base TEXT,
    quantity INTEGER NOT NULL,
    transferred_at TIMESTAMP DEFAULT NOW(),
    performed_by INTEGER REFERENCES users(id)
);

INSERT INTO transfers (asset_id, from_base, to_base, quantity, performed_by)
VALUES (2, 'Base Beta', 'Base Alpha', 20, 2);

-- ASSIGNMENTS TABLE
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
    assigned_to TEXT,
    quantity INTEGER NOT NULL,
    assigned_at TIMESTAMP DEFAULT NOW(),
    performed_by INTEGER REFERENCES users(id)
);

INSERT INTO assignments (asset_id, assigned_to, quantity, performed_by)
VALUES (1, 'Sgt. Roy', 1, 2);

-- API LOG TABLE
CREATE TABLE api_logs (
    id SERIAL PRIMARY KEY,
    path TEXT,
    method TEXT,
    user_id INTEGER,
    body JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
