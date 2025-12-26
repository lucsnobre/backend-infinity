const express = require('express');
const { getDb } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/me', requireAuth, (req, res) => {
  const db = getDb();
  const user = db
    .prepare('SELECT id, email, username, display_name, bio, timezone, created_at, updated_at, last_login_at FROM users WHERE id = ?')
    .get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'not_found' });
  }

  return res.json({ user });
});

router.patch('/me', requireAuth, (req, res) => {
  const { displayName, bio, timezone } = req.body || {};

  const db = getDb();
  db.prepare(
    'UPDATE users SET display_name = COALESCE(?, display_name), bio = COALESCE(?, bio), timezone = COALESCE(?, timezone), updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(displayName ?? null, bio ?? null, timezone ?? null, req.user.id);

  const user = db
    .prepare('SELECT id, email, username, display_name, bio, timezone, created_at, updated_at, last_login_at FROM users WHERE id = ?')
    .get(req.user.id);

  return res.json({ user });
});

router.get('/search', requireAuth, (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) {
    return res.json({ users: [] });
  }

  const db = getDb();
  const users = db
    .prepare(
      "SELECT id, username, display_name FROM users WHERE username LIKE ? OR display_name LIKE ? ORDER BY username LIMIT 20"
    )
    .all(`%${q}%`, `%${q}%`);

  return res.json({ users });
});

router.get('/:id', requireAuth, (req, res) => {
  const db = getDb();
  const user = db
    .prepare('SELECT id, username, display_name, bio, created_at FROM users WHERE id = ?')
    .get(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'not_found' });
  }

  return res.json({ user });
});

module.exports = router;
