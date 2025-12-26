const { getDb } = require('../../lib/db')

function normalizePair(a, b) {
  return a < b ? [a, b] : [b, a]
}

function userExists(userId) {
  const db = getDb()
  return db.prepare('SELECT id FROM users WHERE id = ?').get(userId)
}

function getFriendshipByPair(userA, userB) {
  const db = getDb()
  const [low, high] = normalizePair(userA, userB)
  return db
    .prepare('SELECT * FROM friendships WHERE user_low_id = ? AND user_high_id = ?')
    .get(low, high)
}

function getFriendshipById(id) {
  const db = getDb()
  return db.prepare('SELECT * FROM friendships WHERE id = ?').get(id)
}

function insertFriendRequest({ id, userA, userB, initiatedBy }) {
  const db = getDb()
  const [low, high] = normalizePair(userA, userB)
  db.prepare(
    "INSERT INTO friendships (id, user_low_id, user_high_id, initiated_by_user_id, status) VALUES (?, ?, ?, ?, 'pending')",
  ).run(id, low, high, initiatedBy)

  return db.prepare('SELECT * FROM friendships WHERE id = ?').get(id)
}

function updateFriendshipStatus({ id, status }) {
  const db = getDb()
  db.prepare('UPDATE friendships SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
    status,
    id,
  )
  return getFriendshipById(id)
}

function listFriends(userId) {
  const db = getDb()
  return db
    .prepare(
      "SELECT f.*, u1.username AS low_username, u2.username AS high_username FROM friendships f JOIN users u1 ON u1.id = f.user_low_id JOIN users u2 ON u2.id = f.user_high_id WHERE (f.user_low_id = ? OR f.user_high_id = ?) AND f.status = 'accepted' ORDER BY f.updated_at DESC",
    )
    .all(userId, userId)
}

function insertRoom({ id, ownerUserId, name, isPublic }) {
  const db = getDb()
  db.prepare('INSERT INTO rooms (id, owner_user_id, name, is_public) VALUES (?, ?, ?, ?)').run(
    id,
    ownerUserId,
    name,
    isPublic ? 1 : 0,
  )
  return db.prepare('SELECT * FROM rooms WHERE id = ?').get(id)
}

function insertRoomMember({ roomId, userId, role }) {
  const db = getDb()
  db.prepare('INSERT OR IGNORE INTO room_members (room_id, user_id, role) VALUES (?, ?, ?)').run(
    roomId,
    userId,
    role,
  )
}

function deleteRoomMember({ roomId, userId }) {
  const db = getDb()
  db.prepare('DELETE FROM room_members WHERE room_id = ? AND user_id = ?').run(roomId, userId)
}

function getRoomById(roomId) {
  const db = getDb()
  return db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId)
}

function listRoomMembers(roomId) {
  const db = getDb()
  return db
    .prepare(
      'SELECT rm.user_id, rm.role, rm.joined_at, u.username, u.display_name FROM room_members rm JOIN users u ON u.id = rm.user_id WHERE rm.room_id = ? ORDER BY rm.joined_at',
    )
    .all(roomId)
}

function listRoomQueue(roomId) {
  const db = getDb()
  return db
    .prepare(
      "SELECT rqi.id, rqi.status, rqi.created_at, t.* FROM room_queue_items rqi JOIN tracks t ON t.id = rqi.track_id WHERE rqi.room_id = ? AND rqi.status IN ('queued','playing') ORDER BY rqi.created_at",
    )
    .all(roomId)
}

function isRoomMember({ roomId, userId }) {
  const db = getDb()
  return db.prepare('SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ?').get(roomId, userId)
}

function insertRoomQueueItem({ id, roomId, trackId, addedByUserId }) {
  const db = getDb()
  db.prepare('INSERT INTO room_queue_items (id, room_id, track_id, added_by_user_id) VALUES (?, ?, ?, ?)').run(
    id,
    roomId,
    trackId,
    addedByUserId || null,
  )
  return db.prepare('SELECT * FROM room_queue_items WHERE id = ?').get(id)
}

function insertRoomEvent({ id, roomId, userId, type, payloadJson }) {
  const db = getDb()
  db.prepare('INSERT INTO room_events (id, room_id, user_id, type, payload_json) VALUES (?, ?, ?, ?, ?)').run(
    id,
    roomId,
    userId || null,
    type,
    payloadJson || null,
  )
}

function listRoomEvents({ roomId, since }) {
  const db = getDb()
  if (since) {
    return db
      .prepare('SELECT * FROM room_events WHERE room_id = ? AND created_at > ? ORDER BY created_at LIMIT 200')
      .all(roomId, since)
  }

  return db
    .prepare('SELECT * FROM room_events WHERE room_id = ? ORDER BY created_at DESC LIMIT 200')
    .all(roomId)
}

module.exports = {
  normalizePair,
  userExists,
  getFriendshipByPair,
  getFriendshipById,
  insertFriendRequest,
  updateFriendshipStatus,
  listFriends,
  insertRoom,
  insertRoomMember,
  deleteRoomMember,
  getRoomById,
  listRoomMembers,
  listRoomQueue,
  isRoomMember,
  insertRoomQueueItem,
  insertRoomEvent,
  listRoomEvents,
}
