const { getDb } = require('../../lib/db')

function listBadges() {
  const db = getDb()
  return db.prepare('SELECT * FROM badges ORDER BY category, name').all()
}

function listUserBadges(userId) {
  const db = getDb()
  return db
    .prepare(
      'SELECT b.*, ub.acquired_at FROM user_badges ub JOIN badges b ON b.id = ub.badge_id WHERE ub.user_id = ? ORDER BY ub.acquired_at DESC'
    )
    .all(userId)
}

module.exports = {
  listBadges,
  listUserBadges,
}
