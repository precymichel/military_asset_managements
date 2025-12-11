# Military Asset Management System (Minimal Fullstack)
This is a minimal starter fullstack app (React frontend + Node/Express backend + PostgreSQL) implementing core features described in the prompt:
- Dashboard with opening/closing balances and net movement
- Purchases, Transfers, Assignments/Expenditures pages
- RBAC with Admin / Base Commander / Logistics Officer
- API logging (simple)
- PostgreSQL schema and seed SQL included

## What you get
- `backend/` — Express server, JWT auth, asset APIs
- `frontend/` — React app (CRA-like minimal setup) using fetch to call backend
- `psql_dump.sql` — SQL to create tables and seed example data
- `zip` — this project packaged as a zip file in this folder

## Quick setup (summary)
1. Install prerequisites: Node.js (18+), npm, PostgreSQL.
2. Create a Postgres DB, e.g. `mil_assets`. Run `psql -d mil_assets -f psql_dump.sql` to create schema & seed.
3. Backend:
   - `cd backend`
   - copy `.env.example` to `.env` and edit values (PG connection string, JWT secret)
   - `npm install`
   - `npm run dev` (or `node server.js`)
4. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm start` (runs on 3000; ensure backend runs on 4000)
5. Login with seeded users (see SQL).

For full step-by-step instructions, open `backend/` and `frontend/` folders and follow README files there.
