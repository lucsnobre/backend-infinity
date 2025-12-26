const { getDb } = require('../../lib/db')

function findUserAuthByEmailOrUsername(emailOrUsername) {
  const db = getDb()
  return db
    .prepare('SELECT id, password_hash FROM users WHERE email = ? OR username = ? LIMIT 1')
    .get(emailOrUsername, emailOrUsername)
}

function findUserByEmailOrUsername(email, username) {
  const db = getDb()
  return db
    .prepare('SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1')
    .get(email, username)
}

function insertUser({ id, email, username, passwordHash, displayName }) {
  const db = getDb()
  db.prepare(
    'INSERT INTO users (id, email, username, password_hash, display_name) VALUES (?, ?, ?, ?, ?)'
  ).run(id, email, username, passwordHash, displayName || null)
}

function touchUserAfterLogin(userId) {
  const db = getDb()
  db.prepare(
    'UPDATE users SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(userId)
}

function ensureUserStats(userId) {
  const db = getDb()
  db.prepare('INSERT OR IGNORE INTO user_stats (user_id) VALUES (?)').run(userId)
}

function ensureUserAiProfile(userId) {
  const db = getDb()
  db.prepare(
    'INSERT OR REPLACE INTO user_ai_profiles (user_id, updated_at) VALUES (?, CURRENT_TIMESTAMP)'
  ).run(userId)
}

function getMe(userId) {
  const db = getDb()
  return db
    .prepare(
      'SELECT id, email, username, display_name, bio, timezone, created_at, updated_at, last_login_at FROM users WHERE id = ?'
    )
    .get(userId)
}

function updateMe({ userId, displayName, bio, timezone }) {
  const db = getDb()
  db.prepare(
    'UPDATE users SET display_name = COALESCE(?, display_name), bio = COALESCE(?, bio), timezone = COALESCE(?, timezone), updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(displayName ?? null, bio ?? null, timezone ?? null, userId)
}

function searchUsers(q) {
  const db = getDb()
  return db
    .prepare(
      'SELECT id, username, display_name FROM users WHERE username LIKE ? OR display_name LIKE ? ORDER BY username LIMIT 20'
    )
    .all(`%${q}%`, `%${q}%`)
}

function getPublicUserById(id) {
  const db = getDb()
  return db
    .prepare('SELECT id, username, display_name, bio, created_at FROM users WHERE id = ?')
    .get(id)
}

module.exports = {
  findUserAuthByEmailOrUsername,
  findUserByEmailOrUsername,
  insertUser,
  touchUserAfterLogin,
  ensureUserStats,
  ensureUserAiProfile,
  getMe,
  updateMe,
  searchUsers,
  getPublicUserById,
}
