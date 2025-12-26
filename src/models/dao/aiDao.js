const { getDb } = require('../../lib/db')

function getAiProfile(userId) {
  const db = getDb()
  return db.prepare('SELECT * FROM user_ai_profiles WHERE user_id = ?').get(userId)
}

function upsertAiProfile({ userId, personalityLabel, personalityDescription, tasteSummary, modelVersion }) {
  const db = getDb()
  db.prepare(
    'INSERT INTO user_ai_profiles (user_id, personality_label, personality_description, taste_summary, model_version, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP) ' +
      'ON CONFLICT(user_id) DO UPDATE SET personality_label = excluded.personality_label, personality_description = excluded.personality_description, taste_summary = excluded.taste_summary, model_version = excluded.model_version, updated_at = CURRENT_TIMESTAMP',
  ).run(userId, personalityLabel || null, personalityDescription || null, tasteSummary || null, modelVersion || null)

  return getAiProfile(userId)
}

function insertListeningEvent({ id, userId, trackId, startedAt, endedAt, durationSeconds, mood, timeOfDay }) {
  const db = getDb()
  db.prepare(
    'INSERT INTO listening_events (id, user_id, track_id, started_at, ended_at, duration_seconds, mood, time_of_day) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(
    id,
    userId,
    trackId,
    startedAt,
    endedAt || null,
    Number.isFinite(durationSeconds) ? durationSeconds : null,
    mood || null,
    timeOfDay || null,
  )

  return db.prepare('SELECT * FROM listening_events WHERE id = ?').get(id)
}

function ensureUserStats(userId) {
  const db = getDb()
  db.prepare('INSERT OR IGNORE INTO user_stats (user_id) VALUES (?)').run(userId)
}

function incrementUserListeningStats({ userId, eventId }) {
  const db = getDb()
  db.prepare(
    'UPDATE user_stats SET tracks_listened = tracks_listened + 1, xp = xp + 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
  ).run(userId)

  db.prepare('INSERT INTO user_xp_events (id, user_id, kind, delta_xp, ref_id) VALUES (?, ?, ?, ?, ?)').run(
    eventId,
    userId,
    'listening_event',
    1,
    eventId,
  )
}

function countFavorites(userId) {
  const db = getDb()
  return db.prepare('SELECT COUNT(*) AS c FROM user_favorite_tracks WHERE user_id = ?').get(userId).c
}

function getTracksListened(userId) {
  const db = getDb()
  return db.prepare('SELECT tracks_listened AS c FROM user_stats WHERE user_id = ?').get(userId)?.c || 0
}

function countFriends(userId) {
  const db = getDb()
  return db
    .prepare(
      "SELECT COUNT(*) AS c FROM friendships WHERE status = 'accepted' AND (user_low_id = ? OR user_high_id = ?)",
    )
    .get(userId, userId).c
}

function grantBadge(userId, badgeId) {
  const db = getDb()
  db.prepare('INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)').run(userId, badgeId)
}

function getFavoriteGenreIds(userId, limit = 5) {
  const db = getDb()
  const rows = db
    .prepare(
      'SELECT tg.genre_id AS genre_id, COUNT(*) AS c FROM user_favorite_tracks uft JOIN track_genres tg ON tg.track_id = uft.track_id WHERE uft.user_id = ? GROUP BY tg.genre_id ORDER BY c DESC LIMIT ?',
    )
    .all(userId, limit)

  return rows.map((r) => r.genre_id)
}

function findTracksByContextAndGenres({ mood, timeOfDay, genreIds, limit }) {
  const db = getDb()
  if (genreIds.length > 0) {
    const placeholders = genreIds.map(() => '?').join(',')
    return db
      .prepare(
        `SELECT DISTINCT t.* FROM tracks t
         JOIN track_context_tags tct ON tct.track_id = t.id
         LEFT JOIN track_genres tg ON tg.track_id = t.id
         WHERE tct.mood = ? AND tct.time_of_day = ? AND tg.genre_id IN (${placeholders})
         ORDER BY tct.weight DESC, t.created_at DESC
         LIMIT ?`,
      )
      .all(mood, timeOfDay, ...genreIds, limit)
  }

  return db
    .prepare(
      'SELECT DISTINCT t.* FROM tracks t JOIN track_context_tags tct ON tct.track_id = t.id WHERE tct.mood = ? AND tct.time_of_day = ? ORDER BY tct.weight DESC, t.created_at DESC LIMIT ?',
    )
    .all(mood, timeOfDay, limit)
}

function findTracksByGenres({ genreIds, limit }) {
  const db = getDb()
  if (genreIds.length > 0) {
    const placeholders = genreIds.map(() => '?').join(',')
    return db
      .prepare(
        `SELECT DISTINCT t.* FROM tracks t
         JOIN track_genres tg ON tg.track_id = t.id
         WHERE tg.genre_id IN (${placeholders})
         ORDER BY t.created_at DESC
         LIMIT ?`,
      )
      .all(...genreIds, limit)
  }

  return db.prepare('SELECT * FROM tracks ORDER BY created_at DESC LIMIT ?').all(limit)
}

function insertRecommendationRun({ id, userId, mood, timeOfDay, algorithm, requestJson }) {
  const db = getDb()
  db.prepare(
    'INSERT INTO recommendation_runs (id, user_id, mood, time_of_day, algorithm, request_json) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(id, userId, mood || null, timeOfDay || null, algorithm, requestJson)
}

function insertRecommendationItem({ runId, trackId, rank, score, reason }) {
  const db = getDb()
  db.prepare(
    'INSERT OR IGNORE INTO recommendation_items (run_id, track_id, rank, score, reason) VALUES (?, ?, ?, ?, ?)',
  ).run(runId, trackId, rank, score ?? null, reason || null)
}

function transaction(fn) {
  const db = getDb()
  return db.transaction(fn)
}

module.exports = {
  getAiProfile,
  upsertAiProfile,
  insertListeningEvent,
  ensureUserStats,
  incrementUserListeningStats,
  countFavorites,
  getTracksListened,
  countFriends,
  grantBadge,
  getFavoriteGenreIds,
  findTracksByContextAndGenres,
  findTracksByGenres,
  insertRecommendationRun,
  insertRecommendationItem,
  transaction,
}
