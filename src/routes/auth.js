const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');

const router = express.Router();

router.post('/register', (req, res) => {
  const { email, username, password, displayName } = req.body || {};

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const db = getDb();

  const existing = db
    .prepare('SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1')
    .get(email, username);

  if (existing) {
    return res.status(409).json({ error: 'user_exists' });
  }

  const id = uuidv4();
  const passwordHash = bcrypt.hashSync(password, 10);

  db.prepare(
    'INSERT INTO users (id, email, username, password_hash, display_name) VALUES (?, ?, ?, ?, ?)'
  ).run(id, email, username, passwordHash, displayName || null);

  db.prepare('INSERT OR IGNORE INTO user_stats (user_id) VALUES (?)').run(id);
  db.prepare('INSERT OR REPLACE INTO user_ai_profiles (user_id, updated_at) VALUES (?, CURRENT_TIMESTAMP)').run(id);

  const token = jwt.sign({ sub: id }, process.env.JWT_SECRET || 'dev-secret-change-me', {
    expiresIn: '30d'
  });

  return res.status(201).json({ token });
});

router.post('/login', (req, res) => {
  const { emailOrUsername, password } = req.body || {};
  if (!emailOrUsername || !password) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const db = getDb();

  const user = db
    .prepare('SELECT id, password_hash FROM users WHERE email = ? OR username = ? LIMIT 1')
    .get(emailOrUsername, emailOrUsername);

  if (!user) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET || 'dev-secret-change-me', {
    expiresIn: '30d'
  });

  return res.json({ token });
});

module.exports = router;
