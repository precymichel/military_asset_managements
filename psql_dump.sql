-- PostgreSQL schema and seed data for Military Asset Management System
DROP TABLE IF EXISTS api_logs CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS transfers CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- plaintext in seed only; hash in production
  role TEXT NOT NULL, -- admin, base_commander, logistics_officer
  base TEXT -- assigned base (nullable for admin)
);

CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  equipment_type TEXT,
  base TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE purchases (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  purchased_at TIMESTAMP DEFAULT now(),
  description TEXT
);

CREATE TABLE transfers (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
  from_base TEXT,
  to_base TEXT,
  quantity INTEGER NOT NULL,
  transferred_at TIMESTAMP DEFAULT now(),
  performed_by INTEGER REFERENCES users(id)
);

CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
  assigned_to TEXT, -- personnel identifier
  quantity INTEGER NOT NULL,
  assigned_at TIMESTAMP DEFAULT now(),
  performed_by INTEGER REFERENCES users(id)
);

CREATE TABLE api_logs (
  id SERIAL PRIMARY KEY,
  path TEXT,
  method TEXT,
  user_id INTEGER,
  body JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- Seed users: passwords "adminpass", "commanderpass", "logipass" (plaintext for demo only)
INSERT INTO users (username, password, role, base) VALUES
('admin', 'adminpass', 'admin', NULL),
('cmd_alfa', 'commanderpass', 'base_commander', 'Base Alpha'),
('log_beta', 'logipass', 'logistics_officer', 'Base Beta');

-- Seed assets
INSERT INTO assets (name, equipment_type, base, quantity) VALUES
('Truck A', 'vehicle', 'Base Alpha', 10),
('Rifle X', 'weapon', 'Base Beta', 200),
('Ammo 5.56', 'ammunition', 'Base Beta', 5000);

-- Sample purchase and transfer
INSERT INTO purchases (asset_id, quantity, description) VALUES (1, 2, 'New trucks delivered');
INSERT INTO transfers (asset_id, from_base, to_base, quantity, performed_by) VALUES (2, 'Base Beta', 'Base Alpha', 20, 2);
INSERT INTO assignments (asset_id, assigned_to, quantity, performed_by) VALUES (1, 'Sgt. Roy', 1, 2);
