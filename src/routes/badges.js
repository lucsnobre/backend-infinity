const express = require('express');
const { getDb } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const db = getDb();
  const badges = db.prepare('SELECT * FROM badges ORDER BY category, name').all();
  return res.json({ badges });
});

router.get('/me', requireAuth, (req, res) => {
  const db = getDb();
  const badges = db
    .prepare('SELECT b.*, ub.acquired_at FROM user_badges ub JOIN badges b ON b.id = ub.badge_id WHERE ub.user_id = ? ORDER BY ub.acquired_at DESC')
    .all(req.user.id);

  return res.json({ badges });
});

module.exports = router;
