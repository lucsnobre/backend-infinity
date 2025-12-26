const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function normalizePair(a, b) {
  return a < b ? [a, b] : [b, a];
}

router.post('/friends/requests', requireAuth, (req, res) => {
  const { toUserId } = req.body || {};
  if (!toUserId) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  if (toUserId === req.user.id) {
    return res.status(400).json({ error: 'invalid_target' });
  }

  const db = getDb();

  const toUser = db.prepare('SELECT id FROM users WHERE id = ?').get(toUserId);
  if (!toUser) {
    return res.status(404).json({ error: 'user_not_found' });
  }

  const [low, high] = normalizePair(req.user.id, toUserId);

  const existing = db.prepare('SELECT * FROM friendships WHERE user_low_id = ? AND user_high_id = ?').get(low, high);
  if (existing) {
    return res.status(409).json({ error: 'friendship_exists', friendship: existing });
  }

  const id = uuidv4();
  db.prepare(
    "INSERT INTO friendships (id, user_low_id, user_high_id, initiated_by_user_id, status) VALUES (?, ?, ?, ?, 'pending')"
  ).run(id, low, high, req.user.id);

  const friendship = db.prepare('SELECT * FROM friendships WHERE id = ?').get(id);
  return res.status(201).json({ friendship });
});

router.post('/friends/requests/:id/accept', requireAuth, (req, res) => {
  const db = getDb();

  const friendship = db.prepare('SELECT * FROM friendships WHERE id = ?').get(req.params.id);
  if (!friendship) {
    return res.status(404).json({ error: 'not_found' });
  }

  if (![friendship.user_low_id, friendship.user_high_id].includes(req.user.id)) {
    return res.status(403).json({ error: 'forbidden' });
  }

  if (friendship.status !== 'pending') {
    return res.status(409).json({ error: 'invalid_state' });
  }

  db.prepare("UPDATE friendships SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);

  const updated = db.prepare('SELECT * FROM friendships WHERE id = ?').get(req.params.id);
  return res.json({ friendship: updated });
});

router.post('/friends/requests/:id/reject', requireAuth, (req, res) => {
  const db = getDb();

  const friendship = db.prepare('SELECT * FROM friendships WHERE id = ?').get(req.params.id);
  if (!friendship) {
    return res.status(404).json({ error: 'not_found' });
  }

  if (![friendship.user_low_id, friendship.user_high_id].includes(req.user.id)) {
    return res.status(403).json({ error: 'forbidden' });
  }

  if (friendship.status !== 'pending') {
    return res.status(409).json({ error: 'invalid_state' });
  }

  db.prepare("UPDATE friendships SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);

  const updated = db.prepare('SELECT * FROM friendships WHERE id = ?').get(req.params.id);
  return res.json({ friendship: updated });
});

router.get('/friends', requireAuth, (req, res) => {
  const db = getDb();

  const rows = db
    .prepare(
      "SELECT f.*, u1.username AS low_username, u2.username AS high_username FROM friendships f JOIN users u1 ON u1.id = f.user_low_id JOIN users u2 ON u2.id = f.user_high_id WHERE (f.user_low_id = ? OR f.user_high_id = ?) AND f.status = 'accepted' ORDER BY f.updated_at DESC"
    )
    .all(req.user.id, req.user.id);

  return res.json({ friendships: rows });
});

router.post('/rooms', requireAuth, (req, res) => {
  const { name, isPublic } = req.body || {};
  if (!name) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const db = getDb();
  const id = uuidv4();

  const tx = db.transaction(() => {
    db.prepare('INSERT INTO rooms (id, owner_user_id, name, is_public) VALUES (?, ?, ?, ?)').run(
      id,
      req.user.id,
      name,
      isPublic ? 1 : 0
    );

    db.prepare("INSERT INTO room_members (room_id, user_id, role) VALUES (?, ?, 'owner')").run(id, req.user.id);
    db.prepare('INSERT INTO room_events (id, room_id, user_id, type, payload_json) VALUES (?, ?, ?, ?, ?)').run(
      uuidv4(),
      id,
      req.user.id,
      'room_created',
      JSON.stringify({ name, isPublic: !!isPublic })
    );
  });

  tx();

  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);
  return res.status(201).json({ room });
});

router.post('/rooms/:id/join', requireAuth, (req, res) => {
  const db = getDb();
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
  if (!room) {
    return res.status(404).json({ error: 'not_found' });
  }

  db.prepare('INSERT OR IGNORE INTO room_members (room_id, user_id, role) VALUES (?, ?, ?)').run(
    req.params.id,
    req.user.id,
    'member'
  );

  db.prepare('INSERT INTO room_events (id, room_id, user_id, type, payload_json) VALUES (?, ?, ?, ?, ?)').run(
    uuidv4(),
    req.params.id,
    req.user.id,
    'member_joined',
    JSON.stringify({ userId: req.user.id })
  );

  return res.status(204).send();
});

router.post('/rooms/:id/leave', requireAuth, (req, res) => {
  const db = getDb();

  db.prepare('DELETE FROM room_members WHERE room_id = ? AND user_id = ?').run(req.params.id, req.user.id);

  db.prepare('INSERT INTO room_events (id, room_id, user_id, type, payload_json) VALUES (?, ?, ?, ?, ?)').run(
    uuidv4(),
    req.params.id,
    req.user.id,
    'member_left',
    JSON.stringify({ userId: req.user.id })
  );

  return res.status(204).send();
});

router.get('/rooms/:id', requireAuth, (req, res) => {
  const db = getDb();

  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
  if (!room) {
    return res.status(404).json({ error: 'not_found' });
  }

  const members = db
    .prepare('SELECT rm.user_id, rm.role, rm.joined_at, u.username, u.display_name FROM room_members rm JOIN users u ON u.id = rm.user_id WHERE rm.room_id = ? ORDER BY rm.joined_at')
    .all(req.params.id);

  const queue = db
    .prepare(
      "SELECT rqi.id, rqi.status, rqi.created_at, t.* FROM room_queue_items rqi JOIN tracks t ON t.id = rqi.track_id WHERE rqi.room_id = ? AND rqi.status IN ('queued','playing') ORDER BY rqi.created_at"
    )
    .all(req.params.id);

  return res.json({ room, members, queue });
});

router.post('/rooms/:id/queue', requireAuth, (req, res) => {
  const { trackId } = req.body || {};
  if (!trackId) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const db = getDb();

  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
  if (!room) {
    return res.status(404).json({ error: 'not_found' });
  }

  const isMember = db.prepare('SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!isMember) {
    return res.status(403).json({ error: 'not_room_member' });
  }

  const track = db.prepare('SELECT id FROM tracks WHERE id = ?').get(trackId);
  if (!track) {
    return res.status(404).json({ error: 'track_not_found' });
  }

  const id = uuidv4();
  db.prepare('INSERT INTO room_queue_items (id, room_id, track_id, added_by_user_id) VALUES (?, ?, ?, ?)').run(
    id,
    req.params.id,
    trackId,
    req.user.id
  );

  db.prepare('INSERT INTO room_events (id, room_id, user_id, type, payload_json) VALUES (?, ?, ?, ?, ?)').run(
    uuidv4(),
    req.params.id,
    req.user.id,
    'queue_added',
    JSON.stringify({ queueItemId: id, trackId })
  );

  const item = db.prepare('SELECT * FROM room_queue_items WHERE id = ?').get(id);
  return res.status(201).json({ item });
});

router.get('/rooms/:id/events', requireAuth, (req, res) => {
  const since = String(req.query.since || '').trim();
  const db = getDb();

  const events = since
    ? db.prepare('SELECT * FROM room_events WHERE room_id = ? AND created_at > ? ORDER BY created_at LIMIT 200').all(req.params.id, since)
    : db.prepare('SELECT * FROM room_events WHERE room_id = ? ORDER BY created_at DESC LIMIT 200').all(req.params.id);

  return res.json({ events });
});

module.exports = router;
