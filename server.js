require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simple API logging middleware
app.use(async (req, res, next) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    let userId = null;
    if (token) {
      try { userId = jwt.verify(token, process.env.JWT_SECRET).id; } catch(e){}
    }
    await db.query('INSERT INTO api_logs(path, method, user_id, body) VALUES($1,$2,$3,$4)',
      [req.path, req.method, userId, req.body ? JSON.stringify(req.body) : null]);
  } catch(e){ console.error('log error', e.message); }
  next();
});

// Auth - simple username/password -> JWT (demo only: plaintext password compare)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const r = await db.query('SELECT id, username, role, base, password FROM users WHERE username=$1', [username]);
  const user = r.rows[0];
  if (!user || user.password !== password) return res.status(401).json({error: 'invalid'});
  const token = jwt.sign({ id: user.id, role: user.role, base: user.base }, process.env.JWT_SECRET);
  res.json({ token, user: { id: user.id, username: user.username, role: user.role, base: user.base } });
});

// Assets CRUD & core flows
app.get('/api/assets', auth.optional, async (req, res) => {
  const r = await db.query('SELECT * FROM assets ORDER BY id');
  res.json(r.rows);
});

app.post('/api/purchases', auth.required, async (req, res) => {
  // only logistics_officer and admin allowed for demo; base_commander can also if base matches
  const { asset_id, quantity, description } = req.body;
  const user = req.user;
  if (!user) return res.status(401).send({error:'auth required'});
  // insert purchase
  await db.query('INSERT INTO purchases(asset_id, quantity, description) VALUES($1,$2,$3)', [asset_id, quantity, description]);
  // update assets quantity (simple)
  await db.query('UPDATE assets SET quantity = quantity + $1 WHERE id=$2', [quantity, asset_id]);
  res.json({ ok: true });
});

app.post('/api/transfers', auth.required, async (req, res) => {
  const { asset_id, from_base, to_base, quantity } = req.body;
  const user = req.user;
  if (!user) return res.status(401).send({error:'auth required'});
  await db.query('INSERT INTO transfers(asset_id, from_base, to_base, quantity, performed_by) VALUES($1,$2,$3,$4,$5)',
    [asset_id, from_base, to_base, quantity, user.id]);
  // Adjust counts simplistically: reduce from source base, increase to dest base.
  await db.query('UPDATE assets SET quantity = quantity - $1 WHERE id=$2 AND base=$3', [quantity, asset_id, from_base]);
  // If asset exists at to_base, increase, else create row
  const dest = await db.query('SELECT id FROM assets WHERE id=$1 AND base=$2', [asset_id, to_base]);
  if (dest.rows.length) {
    await db.query('UPDATE assets SET quantity = quantity + $1 WHERE id=$2 AND base=$3', [quantity, asset_id, to_base]);
  } else {
    const assetInfo = await db.query('SELECT name, equipment_type FROM assets WHERE id=$1 LIMIT 1', [asset_id]);
    const a = assetInfo.rows[0];
    await db.query('INSERT INTO assets(name, equipment_type, base, quantity) VALUES($1,$2,$3,$4)', [a.name, a.equipment_type, to_base, quantity]);
  }
  res.json({ ok: true });
});

app.post('/api/assign', auth.required, async (req, res) => {
  const { asset_id, assigned_to, quantity } = req.body;
  const user = req.user;
  await db.query('INSERT INTO assignments(asset_id, assigned_to, quantity, performed_by) VALUES($1,$2,$3,$4)',
    [asset_id, assigned_to, quantity, user.id]);
  await db.query('UPDATE assets SET quantity = quantity - $1 WHERE id=$2', [quantity, asset_id]);
  res.json({ ok: true });
});

app.get('/api/dashboard', auth.optional, async (req, res) => {
  // Returns opening, current and net movements per base and type (very simplified)
  const assets = (await db.query('SELECT base, equipment_type, SUM(quantity) as current_total FROM assets GROUP BY base, equipment_type')).rows;
  const purchases = (await db.query('SELECT a.base, p.quantity FROM purchases p JOIN assets a ON p.asset_id = a.id')).rows;
  res.json({ assets, purchases });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Server listening', PORT));
