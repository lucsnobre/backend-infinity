const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/artists', requireAuth, (req, res) => {
  const { name } = req.body || {};
  if (!name) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const db = getDb();
  const id = uuidv4();
  db.prepare('INSERT INTO artists (id, name) VALUES (?, ?)').run(id, name);
  const artist = db.prepare('SELECT id, name, created_at FROM artists WHERE id = ?').get(id);
  return res.status(201).json({ artist });
});

router.get('/artists', requireAuth, (req, res) => {
  const q = String(req.query.q || '').trim();
  const db = getDb();
  const artists = q
    ? db.prepare('SELECT id, name, created_at FROM artists WHERE name LIKE ? ORDER BY name LIMIT 50').all(`%${q}%`)
    : db.prepare('SELECT id, name, created_at FROM artists ORDER BY name LIMIT 50').all();
  return res.json({ artists });
});

router.post('/genres', requireAuth, (req, res) => {
  const { name } = req.body || {};
  if (!name) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const db = getDb();
  const id = uuidv4();
  try {
    db.prepare('INSERT INTO genres (id, name) VALUES (?, ?)').run(id, name);
  } catch (err) {
    return res.status(409).json({ error: 'genre_exists' });
  }

  const genre = db.prepare('SELECT id, name FROM genres WHERE id = ?').get(id);
  return res.status(201).json({ genre });
});

router.get('/genres', requireAuth, (req, res) => {
  const q = String(req.query.q || '').trim();
  const db = getDb();
  const genres = q
    ? db.prepare('SELECT id, name FROM genres WHERE name LIKE ? ORDER BY name LIMIT 100').all(`%${q}%`)
    : db.prepare('SELECT id, name FROM genres ORDER BY name LIMIT 100').all();
  return res.json({ genres });
});

router.post('/tracks/:id/genres', requireAuth, (req, res) => {
  const { genreId } = req.body || {};
  if (!genreId) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const db = getDb();
  const track = db.prepare('SELECT id FROM tracks WHERE id = ?').get(req.params.id);
  if (!track) {
    return res.status(404).json({ error: 'track_not_found' });
  }

  const genre = db.prepare('SELECT id FROM genres WHERE id = ?').get(genreId);
  if (!genre) {
    return res.status(404).json({ error: 'genre_not_found' });
  }

  db.prepare('INSERT OR IGNORE INTO track_genres (track_id, genre_id) VALUES (?, ?)').run(req.params.id, genreId);
  return res.status(204).send();
});

router.delete('/tracks/:id/genres/:genreId', requireAuth, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM track_genres WHERE track_id = ? AND genre_id = ?').run(req.params.id, req.params.genreId);
  return res.status(204).send();
});

router.get('/tracks/:id/context-tags', requireAuth, (req, res) => {
  const db = getDb();
  const tags = db
    .prepare('SELECT track_id, mood, time_of_day, weight FROM track_context_tags WHERE track_id = ? ORDER BY mood, time_of_day')
    .all(req.params.id);
  return res.json({ tags });
});

router.post('/tracks/:id/context-tags', requireAuth, (req, res) => {
  const { mood, timeOfDay, weight } = req.body || {};
  if (!mood || !timeOfDay) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const db = getDb();
  const track = db.prepare('SELECT id FROM tracks WHERE id = ?').get(req.params.id);
  if (!track) {
    return res.status(404).json({ error: 'track_not_found' });
  }

  const w = Number.isFinite(Number(weight)) ? Number(weight) : 1.0;

  db.prepare(
    'INSERT INTO track_context_tags (track_id, mood, time_of_day, weight) VALUES (?, ?, ?, ?) ' +
      'ON CONFLICT(track_id, mood, time_of_day) DO UPDATE SET weight = excluded.weight'
  ).run(req.params.id, mood, timeOfDay, w);

  const tag = db
    .prepare('SELECT track_id, mood, time_of_day, weight FROM track_context_tags WHERE track_id = ? AND mood = ? AND time_of_day = ?')
    .get(req.params.id, mood, timeOfDay);

  return res.status(201).json({ tag });
});

router.delete('/tracks/:id/context-tags', requireAuth, (req, res) => {
  const mood = String(req.query.mood || '').trim();
  const timeOfDay = String(req.query.timeOfDay || '').trim();

  if (!mood || !timeOfDay) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const db = getDb();
  db.prepare('DELETE FROM track_context_tags WHERE track_id = ? AND mood = ? AND time_of_day = ?').run(
    req.params.id,
    mood,
    timeOfDay
  );
  return res.status(204).send();
});

router.post('/albums', requireAuth, (req, res) => {
  const { title, artistId, releaseDate, coverUrl } = req.body || {};
  if (!title) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const db = getDb();
  const id = uuidv4();
  db.prepare(
    'INSERT INTO albums (id, title, artist_id, release_date, cover_url) VALUES (?, ?, ?, ?, ?)'
  ).run(id, title, artistId || null, releaseDate || null, coverUrl || null);

  const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(id);
  return res.status(201).json({ album });
});

router.get('/albums', requireAuth, (req, res) => {
  const q = String(req.query.q || '').trim();
  const db = getDb();

  const albums = q
    ? db
        .prepare(
          'SELECT a.*, ar.name AS artist_name FROM albums a LEFT JOIN artists ar ON ar.id = a.artist_id WHERE a.title LIKE ? ORDER BY a.title LIMIT 50'
        )
        .all(`%${q}%`)
    : db
        .prepare(
          'SELECT a.*, ar.name AS artist_name FROM albums a LEFT JOIN artists ar ON ar.id = a.artist_id ORDER BY a.title LIMIT 50'
        )
        .all();

  return res.json({ albums });
});

router.get('/albums/:id', requireAuth, (req, res) => {
  const db = getDb();
  const album = db
    .prepare('SELECT a.*, ar.name AS artist_name FROM albums a LEFT JOIN artists ar ON ar.id = a.artist_id WHERE a.id = ?')
    .get(req.params.id);

  if (!album) {
    return res.status(404).json({ error: 'not_found' });
  }

  const tracks = db
    .prepare(
      'SELECT t.* FROM album_tracks at JOIN tracks t ON t.id = at.track_id WHERE at.album_id = ? ORDER BY at.disc_number, at.track_number'
    )
    .all(req.params.id);

  return res.json({ album, tracks });
});

router.post('/tracks', requireAuth, (req, res) => {
  const { title, artistId, albumId, durationSeconds, audioUrl, coverUrl, explicit } = req.body || {};
  if (!title) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const db = getDb();
  const id = uuidv4();
  db.prepare(
    'INSERT INTO tracks (id, title, artist_id, album_id, duration_seconds, audio_url, cover_url, explicit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    id,
    title,
    artistId || null,
    albumId || null,
    Number.isFinite(durationSeconds) ? durationSeconds : null,
    audioUrl || null,
    coverUrl || null,
    explicit ? 1 : 0
  );

  if (albumId) {
    db.prepare('INSERT OR IGNORE INTO album_tracks (album_id, track_id) VALUES (?, ?)').run(albumId, id);
  }

  const track = db.prepare('SELECT * FROM tracks WHERE id = ?').get(id);
  return res.status(201).json({ track });
});

router.get('/tracks', requireAuth, (req, res) => {
  const q = String(req.query.q || '').trim();
  const db = getDb();

  const tracks = q
    ? db
        .prepare(
          'SELECT t.*, ar.name AS artist_name, al.title AS album_title FROM tracks t LEFT JOIN artists ar ON ar.id = t.artist_id LEFT JOIN albums al ON al.id = t.album_id WHERE t.title LIKE ? ORDER BY t.title LIMIT 50'
        )
        .all(`%${q}%`)
    : db
        .prepare(
          'SELECT t.*, ar.name AS artist_name, al.title AS album_title FROM tracks t LEFT JOIN artists ar ON ar.id = t.artist_id LEFT JOIN albums al ON al.id = t.album_id ORDER BY t.created_at DESC LIMIT 50'
        )
        .all();

  return res.json({ tracks });
});

router.get('/tracks/:id', requireAuth, (req, res) => {
  const db = getDb();
  const track = db
    .prepare(
      'SELECT t.*, ar.name AS artist_name, al.title AS album_title FROM tracks t LEFT JOIN artists ar ON ar.id = t.artist_id LEFT JOIN albums al ON al.id = t.album_id WHERE t.id = ?'
    )
    .get(req.params.id);

  if (!track) {
    return res.status(404).json({ error: 'not_found' });
  }

  const genres = db
    .prepare('SELECT g.id, g.name FROM track_genres tg JOIN genres g ON g.id = tg.genre_id WHERE tg.track_id = ? ORDER BY g.name')
    .all(req.params.id);

  return res.json({ track, genres });
});

router.post('/tracks/:id/favorite', requireAuth, (req, res) => {
  const db = getDb();

  const track = db.prepare('SELECT id FROM tracks WHERE id = ?').get(req.params.id);
  if (!track) {
    return res.status(404).json({ error: 'not_found' });
  }

  db.prepare('INSERT OR IGNORE INTO user_favorite_tracks (user_id, track_id) VALUES (?, ?)').run(req.user.id, req.params.id);

  return res.status(204).send();
});

router.delete('/tracks/:id/favorite', requireAuth, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM user_favorite_tracks WHERE user_id = ? AND track_id = ?').run(req.user.id, req.params.id);
  return res.status(204).send();
});

router.get('/me/favorites/tracks', requireAuth, (req, res) => {
  const db = getDb();
  const tracks = db
    .prepare(
      'SELECT t.* FROM user_favorite_tracks uft JOIN tracks t ON t.id = uft.track_id WHERE uft.user_id = ? ORDER BY uft.created_at DESC'
    )
    .all(req.user.id);

  return res.json({ tracks });
});

router.post('/albums/:id/save', requireAuth, (req, res) => {
  const db = getDb();

  const album = db.prepare('SELECT id FROM albums WHERE id = ?').get(req.params.id);
  if (!album) {
    return res.status(404).json({ error: 'not_found' });
  }

  db.prepare('INSERT OR IGNORE INTO user_saved_albums (user_id, album_id) VALUES (?, ?)').run(req.user.id, req.params.id);
  return res.status(204).send();
});

router.delete('/albums/:id/save', requireAuth, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM user_saved_albums WHERE user_id = ? AND album_id = ?').run(req.user.id, req.params.id);
  return res.status(204).send();
});

router.get('/me/saved/albums', requireAuth, (req, res) => {
  const db = getDb();
  const albums = db
    .prepare(
      'SELECT a.* FROM user_saved_albums usa JOIN albums a ON a.id = usa.album_id WHERE usa.user_id = ? ORDER BY usa.created_at DESC'
    )
    .all(req.user.id);

  return res.json({ albums });
});

router.post('/playlists', requireAuth, (req, res) => {
  const { name, description, isPublic } = req.body || {};
  if (!name) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const db = getDb();
  const id = uuidv4();
  db.prepare(
    'INSERT INTO playlists (id, owner_user_id, name, description, is_public) VALUES (?, ?, ?, ?, ?)'
  ).run(id, req.user.id, name, description || null, isPublic ? 1 : 0);

  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(id);
  return res.status(201).json({ playlist });
});

router.get('/playlists', requireAuth, (req, res) => {
  const db = getDb();
  const playlists = db
    .prepare('SELECT * FROM playlists WHERE owner_user_id = ? ORDER BY updated_at DESC, created_at DESC')
    .all(req.user.id);

  return res.json({ playlists });
});

router.get('/playlists/:id', requireAuth, (req, res) => {
  const db = getDb();
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);

  if (!playlist) {
    return res.status(404).json({ error: 'not_found' });
  }

  if (playlist.owner_user_id !== req.user.id && !playlist.is_public) {
    return res.status(403).json({ error: 'forbidden' });
  }

  const items = db
    .prepare(
      'SELECT pi.id, pi.position, pi.created_at, t.* FROM playlist_items pi JOIN tracks t ON t.id = pi.track_id WHERE pi.playlist_id = ? ORDER BY COALESCE(pi.position, 2147483647), pi.created_at'
    )
    .all(req.params.id);

  return res.json({ playlist, items });
});

router.post('/playlists/:id/tracks', requireAuth, (req, res) => {
  const { trackId, position } = req.body || {};
  if (!trackId) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const db = getDb();
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
  if (!playlist) {
    return res.status(404).json({ error: 'not_found' });
  }

  if (playlist.owner_user_id !== req.user.id) {
    return res.status(403).json({ error: 'forbidden' });
  }

  const track = db.prepare('SELECT id FROM tracks WHERE id = ?').get(trackId);
  if (!track) {
    return res.status(404).json({ error: 'track_not_found' });
  }

  const id = uuidv4();
  db.prepare(
    'INSERT INTO playlist_items (id, playlist_id, track_id, position, added_by_user_id) VALUES (?, ?, ?, ?, ?)'
  ).run(id, req.params.id, trackId, Number.isFinite(position) ? position : null, req.user.id);

  db.prepare('UPDATE playlists SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);

  const item = db.prepare('SELECT * FROM playlist_items WHERE id = ?').get(id);
  return res.status(201).json({ item });
});

router.delete('/playlists/:id/items/:itemId', requireAuth, (req, res) => {
  const db = getDb();
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
  if (!playlist) {
    return res.status(404).json({ error: 'not_found' });
  }

  if (playlist.owner_user_id !== req.user.id) {
    return res.status(403).json({ error: 'forbidden' });
  }

  db.prepare('DELETE FROM playlist_items WHERE id = ? AND playlist_id = ?').run(req.params.itemId, req.params.id);
  db.prepare('UPDATE playlists SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);

  return res.status(204).send();
});

module.exports = router;
