const { getDb } = require('../../lib/db')

function insertArtist({ id, name }) {
  const db = getDb()
  db.prepare('INSERT INTO artists (id, name) VALUES (?, ?)').run(id, name)
  return db.prepare('SELECT id, name, created_at FROM artists WHERE id = ?').get(id)
}

function listArtists(q) {
  const db = getDb()
  if (q) {
    return db
      .prepare('SELECT id, name, created_at FROM artists WHERE name LIKE ? ORDER BY name LIMIT 50')
      .all(`%${q}%`)
  }
  return db.prepare('SELECT id, name, created_at FROM artists ORDER BY name LIMIT 50').all()
}

function insertGenre({ id, name }) {
  const db = getDb()
  db.prepare('INSERT INTO genres (id, name) VALUES (?, ?)').run(id, name)
  return db.prepare('SELECT id, name FROM genres WHERE id = ?').get(id)
}

function listGenres(q) {
  const db = getDb()
  if (q) {
    return db
      .prepare('SELECT id, name FROM genres WHERE name LIKE ? ORDER BY name LIMIT 100')
      .all(`%${q}%`)
  }
  return db.prepare('SELECT id, name FROM genres ORDER BY name LIMIT 100').all()
}

function getGenreById(id) {
  const db = getDb()
  return db.prepare('SELECT id FROM genres WHERE id = ?').get(id)
}

function getTrackById(id) {
  const db = getDb()
  return db.prepare('SELECT * FROM tracks WHERE id = ?').get(id)
}

function addTrackGenre({ trackId, genreId }) {
  const db = getDb()
  db.prepare('INSERT OR IGNORE INTO track_genres (track_id, genre_id) VALUES (?, ?)').run(
    trackId,
    genreId,
  )
}

function deleteTrackGenre({ trackId, genreId }) {
  const db = getDb()
  db.prepare('DELETE FROM track_genres WHERE track_id = ? AND genre_id = ?').run(trackId, genreId)
}

function listTrackContextTags(trackId) {
  const db = getDb()
  return db
    .prepare(
      'SELECT track_id, mood, time_of_day, weight FROM track_context_tags WHERE track_id = ? ORDER BY mood, time_of_day',
    )
    .all(trackId)
}

function upsertTrackContextTag({ trackId, mood, timeOfDay, weight }) {
  const db = getDb()
  db.prepare(
    'INSERT INTO track_context_tags (track_id, mood, time_of_day, weight) VALUES (?, ?, ?, ?) ' +
      'ON CONFLICT(track_id, mood, time_of_day) DO UPDATE SET weight = excluded.weight',
  ).run(trackId, mood, timeOfDay, weight)

  return db
    .prepare(
      'SELECT track_id, mood, time_of_day, weight FROM track_context_tags WHERE track_id = ? AND mood = ? AND time_of_day = ?',
    )
    .get(trackId, mood, timeOfDay)
}

function deleteTrackContextTag({ trackId, mood, timeOfDay }) {
  const db = getDb()
  db.prepare('DELETE FROM track_context_tags WHERE track_id = ? AND mood = ? AND time_of_day = ?').run(
    trackId,
    mood,
    timeOfDay,
  )
}

function insertAlbum({ id, title, artistId, releaseDate, coverUrl }) {
  const db = getDb()
  db.prepare('INSERT INTO albums (id, title, artist_id, release_date, cover_url) VALUES (?, ?, ?, ?, ?)').run(
    id,
    title,
    artistId || null,
    releaseDate || null,
    coverUrl || null,
  )
  return db.prepare('SELECT * FROM albums WHERE id = ?').get(id)
}

function listAlbums(q) {
  const db = getDb()
  if (q) {
    return db
      .prepare(
        'SELECT a.*, ar.name AS artist_name FROM albums a LEFT JOIN artists ar ON ar.id = a.artist_id WHERE a.title LIKE ? ORDER BY a.title LIMIT 50',
      )
      .all(`%${q}%`)
  }

  return db
    .prepare(
      'SELECT a.*, ar.name AS artist_name FROM albums a LEFT JOIN artists ar ON ar.id = a.artist_id ORDER BY a.title LIMIT 50',
    )
    .all()
}

function getAlbumById(id) {
  const db = getDb()
  return db
    .prepare(
      'SELECT a.*, ar.name AS artist_name FROM albums a LEFT JOIN artists ar ON ar.id = a.artist_id WHERE a.id = ?',
    )
    .get(id)
}

function listAlbumTracks(albumId) {
  const db = getDb()
  return db
    .prepare(
      'SELECT t.* FROM album_tracks at JOIN tracks t ON t.id = at.track_id WHERE at.album_id = ? ORDER BY at.disc_number, at.track_number',
    )
    .all(albumId)
}

function insertTrack({
  id,
  title,
  artistId,
  albumId,
  durationSeconds,
  audioUrl,
  coverUrl,
  explicit,
}) {
  const db = getDb()

  db.prepare(
    'INSERT INTO tracks (id, title, artist_id, album_id, duration_seconds, audio_url, cover_url, explicit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(
    id,
    title,
    artistId || null,
    albumId || null,
    Number.isFinite(durationSeconds) ? durationSeconds : null,
    audioUrl || null,
    coverUrl || null,
    explicit ? 1 : 0,
  )

  if (albumId) {
    db.prepare('INSERT OR IGNORE INTO album_tracks (album_id, track_id) VALUES (?, ?)').run(albumId, id)
  }

  return db.prepare('SELECT * FROM tracks WHERE id = ?').get(id)
}

function listTracks(q) {
  const db = getDb()
  if (q) {
    return db
      .prepare(
        'SELECT t.*, ar.name AS artist_name, al.title AS album_title FROM tracks t LEFT JOIN artists ar ON ar.id = t.artist_id LEFT JOIN albums al ON al.id = t.album_id WHERE t.title LIKE ? ORDER BY t.title LIMIT 50',
      )
      .all(`%${q}%`)
  }

  return db
    .prepare(
      'SELECT t.*, ar.name AS artist_name, al.title AS album_title FROM tracks t LEFT JOIN artists ar ON ar.id = t.artist_id LEFT JOIN albums al ON al.id = t.album_id ORDER BY t.created_at DESC LIMIT 50',
    )
    .all()
}

function getTrackDetails(id) {
  const db = getDb()
  return db
    .prepare(
      'SELECT t.*, ar.name AS artist_name, al.title AS album_title FROM tracks t LEFT JOIN artists ar ON ar.id = t.artist_id LEFT JOIN albums al ON al.id = t.album_id WHERE t.id = ?',
    )
    .get(id)
}

function listTrackGenres(trackId) {
  const db = getDb()
  return db
    .prepare(
      'SELECT g.id, g.name FROM track_genres tg JOIN genres g ON g.id = tg.genre_id WHERE tg.track_id = ? ORDER BY g.name',
    )
    .all(trackId)
}

function favoriteTrack({ userId, trackId }) {
  const db = getDb()
  db.prepare('INSERT OR IGNORE INTO user_favorite_tracks (user_id, track_id) VALUES (?, ?)').run(
    userId,
    trackId,
  )
}

function unfavoriteTrack({ userId, trackId }) {
  const db = getDb()
  db.prepare('DELETE FROM user_favorite_tracks WHERE user_id = ? AND track_id = ?').run(userId, trackId)
}

function listFavoriteTracks(userId) {
  const db = getDb()
  return db
    .prepare(
      'SELECT t.* FROM user_favorite_tracks uft JOIN tracks t ON t.id = uft.track_id WHERE uft.user_id = ? ORDER BY uft.created_at DESC',
    )
    .all(userId)
}

function saveAlbum({ userId, albumId }) {
  const db = getDb()
  db.prepare('INSERT OR IGNORE INTO user_saved_albums (user_id, album_id) VALUES (?, ?)').run(userId, albumId)
}

function unsaveAlbum({ userId, albumId }) {
  const db = getDb()
  db.prepare('DELETE FROM user_saved_albums WHERE user_id = ? AND album_id = ?').run(userId, albumId)
}

function listSavedAlbums(userId) {
  const db = getDb()
  return db
    .prepare(
      'SELECT a.* FROM user_saved_albums usa JOIN albums a ON a.id = usa.album_id WHERE usa.user_id = ? ORDER BY usa.created_at DESC',
    )
    .all(userId)
}

function insertPlaylist({ id, ownerUserId, name, description, isPublic }) {
  const db = getDb()
  db.prepare(
    'INSERT INTO playlists (id, owner_user_id, name, description, is_public) VALUES (?, ?, ?, ?, ?)',
  ).run(id, ownerUserId, name, description || null, isPublic ? 1 : 0)

  return db.prepare('SELECT * FROM playlists WHERE id = ?').get(id)
}

function listPlaylists(ownerUserId) {
  const db = getDb()
  return db
    .prepare('SELECT * FROM playlists WHERE owner_user_id = ? ORDER BY updated_at DESC, created_at DESC')
    .all(ownerUserId)
}

function getPlaylistById(id) {
  const db = getDb()
  return db.prepare('SELECT * FROM playlists WHERE id = ?').get(id)
}

function listPlaylistItems(playlistId) {
  const db = getDb()
  return db
    .prepare(
      'SELECT pi.id, pi.position, pi.created_at, t.* FROM playlist_items pi JOIN tracks t ON t.id = pi.track_id WHERE pi.playlist_id = ? ORDER BY COALESCE(pi.position, 2147483647), pi.created_at',
    )
    .all(playlistId)
}

function insertPlaylistItem({ id, playlistId, trackId, position, addedByUserId }) {
  const db = getDb()
  db.prepare(
    'INSERT INTO playlist_items (id, playlist_id, track_id, position, added_by_user_id) VALUES (?, ?, ?, ?, ?)',
  ).run(id, playlistId, trackId, Number.isFinite(position) ? position : null, addedByUserId)

  db.prepare('UPDATE playlists SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(playlistId)

  return db.prepare('SELECT * FROM playlist_items WHERE id = ?').get(id)
}

function deletePlaylistItem({ playlistId, itemId }) {
  const db = getDb()
  db.prepare('DELETE FROM playlist_items WHERE id = ? AND playlist_id = ?').run(itemId, playlistId)
  db.prepare('UPDATE playlists SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(playlistId)
}

module.exports = {
  insertArtist,
  listArtists,
  insertGenre,
  listGenres,
  getGenreById,
  getTrackById,
  addTrackGenre,
  deleteTrackGenre,
  listTrackContextTags,
  upsertTrackContextTag,
  deleteTrackContextTag,
  insertAlbum,
  listAlbums,
  getAlbumById,
  listAlbumTracks,
  insertTrack,
  listTracks,
  getTrackDetails,
  listTrackGenres,
  favoriteTrack,
  unfavoriteTrack,
  listFavoriteTracks,
  saveAlbum,
  unsaveAlbum,
  listSavedAlbums,
  insertPlaylist,
  listPlaylists,
  getPlaylistById,
  listPlaylistItems,
  insertPlaylistItem,
  deletePlaylistItem,
}
