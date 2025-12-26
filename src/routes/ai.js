const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function computeTimeOfDay(date) {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  if (h >= 18 && h < 23) return 'evening';
  return 'night';
}

function ensureUserStats(db, userId) {
  db.prepare('INSERT OR IGNORE INTO user_stats (user_id) VALUES (?)').run(userId);
}

function maybeGrantBadges(db, userId) {
  const favoritesCount = db.prepare('SELECT COUNT(*) AS c FROM user_favorite_tracks WHERE user_id = ?').get(userId).c;
  const listensCount = db.prepare('SELECT tracks_listened AS c FROM user_stats WHERE user_id = ?').get(userId)?.c || 0;

  if (favoritesCount >= 1) {
    db.prepare('INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)').run(userId, 'badge_first_like');
  }

  if (listensCount >= 10) {
    db.prepare('INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)').run(userId, 'badge_10_listens');
  }

  const friendsCount = db
    .prepare(
      "SELECT COUNT(*) AS c FROM friendships WHERE status = 'accepted' AND (user_low_id = ? OR user_high_id = ?)"
    )
    .get(userId, userId).c;

  if (friendsCount >= 1) {
    db.prepare('INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)').run(userId, 'badge_friend_made');
  }
}

router.get('/profile', requireAuth, (req, res) => {
  const db = getDb();
  const profile = db.prepare('SELECT * FROM user_ai_profiles WHERE user_id = ?').get(req.user.id);
  return res.json({ profile: profile || null });
});

router.post('/profile', requireAuth, (req, res) => {
  const { personalityLabel, personalityDescription, tasteSummary, modelVersion } = req.body || {};

  const db = getDb();
  db.prepare(
    'INSERT INTO user_ai_profiles (user_id, personality_label, personality_description, taste_summary, model_version, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP) ' +
      'ON CONFLICT(user_id) DO UPDATE SET personality_label = excluded.personality_label, personality_description = excluded.personality_description, taste_summary = excluded.taste_summary, model_version = excluded.model_version, updated_at = CURRENT_TIMESTAMP'
  ).run(req.user.id, personalityLabel || null, personalityDescription || null, tasteSummary || null, modelVersion || null);

  const profile = db.prepare('SELECT * FROM user_ai_profiles WHERE user_id = ?').get(req.user.id);
  return res.json({ profile });
});

router.post('/events/listening', requireAuth, (req, res) => {
  const { trackId, startedAt, endedAt, durationSeconds, mood, timeOfDay } = req.body || {};
  if (!trackId || !startedAt) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const db = getDb();
  const track = db.prepare('SELECT id FROM tracks WHERE id = ?').get(trackId);
  if (!track) {
    return res.status(404).json({ error: 'track_not_found' });
  }

  const id = uuidv4();
  const computedTimeOfDay = timeOfDay || computeTimeOfDay(new Date());

  const tx = db.transaction(() => {
    db.prepare(
      'INSERT INTO listening_events (id, user_id, track_id, started_at, ended_at, duration_seconds, mood, time_of_day) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      id,
      req.user.id,
      trackId,
      startedAt,
      endedAt || null,
      Number.isFinite(durationSeconds) ? durationSeconds : null,
      mood || null,
      computedTimeOfDay
    );

    ensureUserStats(db, req.user.id);

    db.prepare(
      'UPDATE user_stats SET tracks_listened = tracks_listened + 1, xp = xp + 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?'
    ).run(req.user.id);

    db.prepare('INSERT INTO user_xp_events (id, user_id, kind, delta_xp, ref_id) VALUES (?, ?, ?, ?, ?)').run(
      uuidv4(),
      req.user.id,
      'listening_event',
      1,
      id
    );

    maybeGrantBadges(db, req.user.id);
  });

  tx();

  const event = db.prepare('SELECT * FROM listening_events WHERE id = ?').get(id);
  return res.status(201).json({ event });
});

router.post('/recommendations/request', requireAuth, (req, res) => {
  const { mood, timeOfDay, limit } = req.body || {};
  const max = Math.max(1, Math.min(50, Number(limit) || 20));

  const db = getDb();

  const favGenreRows = db
    .prepare(
      "SELECT tg.genre_id AS genre_id, COUNT(*) AS c FROM user_favorite_tracks uft JOIN track_genres tg ON tg.track_id = uft.track_id WHERE uft.user_id = ? GROUP BY tg.genre_id ORDER BY c DESC LIMIT 5"
    )
    .all(req.user.id);

  const genreIds = favGenreRows.map((r) => r.genre_id);

  let tracks = [];

  if (mood && timeOfDay) {
    if (genreIds.length > 0) {
      const placeholders = genreIds.map(() => '?').join(',');
      tracks = db
        .prepare(
          `SELECT DISTINCT t.* FROM tracks t
           JOIN track_context_tags tct ON tct.track_id = t.id
           LEFT JOIN track_genres tg ON tg.track_id = t.id
           WHERE tct.mood = ? AND tct.time_of_day = ? AND tg.genre_id IN (${placeholders})
           ORDER BY tct.weight DESC, t.created_at DESC
           LIMIT ?`
        )
        .all(mood, timeOfDay, ...genreIds, max);
    } else {
      tracks = db
        .prepare(
          'SELECT DISTINCT t.* FROM tracks t JOIN track_context_tags tct ON tct.track_id = t.id WHERE tct.mood = ? AND tct.time_of_day = ? ORDER BY tct.weight DESC, t.created_at DESC LIMIT ?'
        )
        .all(mood, timeOfDay, max);
    }
  }

  if (tracks.length === 0) {
    if (genreIds.length > 0) {
      const placeholders = genreIds.map(() => '?').join(',');
      tracks = db
        .prepare(
          `SELECT DISTINCT t.* FROM tracks t
           JOIN track_genres tg ON tg.track_id = t.id
           WHERE tg.genre_id IN (${placeholders})
           ORDER BY t.created_at DESC
           LIMIT ?`
        )
        .all(...genreIds, max);
    } else {
      tracks = db.prepare('SELECT * FROM tracks ORDER BY created_at DESC LIMIT ?').all(max);
    }
  }

  const runId = uuidv4();
  const tx = db.transaction(() => {
    db.prepare(
      'INSERT INTO recommendation_runs (id, user_id, mood, time_of_day, algorithm, request_json) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(runId, req.user.id, mood || null, timeOfDay || null, 'heuristic_v1', JSON.stringify({ mood, timeOfDay, limit: max }));

    for (let i = 0; i < tracks.length; i += 1) {
      db.prepare(
        'INSERT OR IGNORE INTO recommendation_items (run_id, track_id, rank, score, reason) VALUES (?, ?, ?, ?, ?)'
      ).run(runId, tracks[i].id, i + 1, null, 'context+preferences');
    }
  });

  tx();

  return res.json({ runId, tracks });
});

module.exports = router;
