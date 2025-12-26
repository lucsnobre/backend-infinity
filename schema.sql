PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  bio TEXT,
  timezone TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  last_login_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS genres (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS artists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);

CREATE TABLE IF NOT EXISTS albums (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist_id TEXT,
  release_date TEXT,
  cover_url TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_albums_artist_id ON albums(artist_id);
CREATE INDEX IF NOT EXISTS idx_albums_title ON albums(title);

CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist_id TEXT,
  album_id TEXT,
  duration_seconds INTEGER,
  audio_url TEXT,
  cover_url TEXT,
  explicit INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL,
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tracks_title ON tracks(title);
CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_tracks_album_id ON tracks(album_id);

CREATE TABLE IF NOT EXISTS album_tracks (
  album_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  disc_number INTEGER NOT NULL DEFAULT 1,
  track_number INTEGER,
  PRIMARY KEY (album_id, track_id),
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS track_genres (
  track_id TEXT NOT NULL,
  genre_id TEXT NOT NULL,
  PRIMARY KEY (track_id, genre_id),
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
  FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_track_genres_genre_id ON track_genres(genre_id);

CREATE TABLE IF NOT EXISTS track_context_tags (
  track_id TEXT NOT NULL,
  mood TEXT NOT NULL,
  time_of_day TEXT NOT NULL,
  weight REAL NOT NULL DEFAULT 1.0,
  PRIMARY KEY (track_id, mood, time_of_day),
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_track_context_tags_mood_time ON track_context_tags(mood, time_of_day);

CREATE TABLE IF NOT EXISTS user_favorite_tracks (
  user_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (user_id, track_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_favorite_tracks_track_id ON user_favorite_tracks(track_id);

CREATE TABLE IF NOT EXISTS user_saved_albums (
  user_id TEXT NOT NULL,
  album_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (user_id, album_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_saved_albums_album_id ON user_saved_albums(album_id);

CREATE TABLE IF NOT EXISTS playlists (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_playlists_owner_user_id ON playlists(owner_user_id);

CREATE TABLE IF NOT EXISTS playlist_items (
  id TEXT PRIMARY KEY,
  playlist_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  position INTEGER,
  added_by_user_id TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
  FOREIGN KEY (added_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist_id ON playlist_items(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_items_track_id ON playlist_items(track_id);

CREATE TABLE IF NOT EXISTS friendships (
  id TEXT PRIMARY KEY,
  user_low_id TEXT NOT NULL,
  user_high_id TEXT NOT NULL,
  initiated_by_user_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  UNIQUE (user_low_id, user_high_id),
  FOREIGN KEY (user_low_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user_high_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (initiated_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rooms_owner_user_id ON rooms(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_rooms_is_public ON rooms(is_public);

CREATE TABLE IF NOT EXISTS room_members (
  room_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (room_id, user_id),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON room_members(user_id);

CREATE TABLE IF NOT EXISTS room_queue_items (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  added_by_user_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'playing', 'played', 'skipped')),
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
  FOREIGN KEY (added_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_room_queue_items_room_id ON room_queue_items(room_id);
CREATE INDEX IF NOT EXISTS idx_room_queue_items_status ON room_queue_items(status);

CREATE TABLE IF NOT EXISTS room_events (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  user_id TEXT,
  type TEXT NOT NULL,
  payload_json TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_room_events_room_id_created_at ON room_events(room_id, created_at);

CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  criteria_json TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS user_badges (
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  acquired_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (user_id, badge_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

CREATE TABLE IF NOT EXISTS user_stats (
  user_id TEXT PRIMARY KEY,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  tracks_listened INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_xp_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  delta_xp INTEGER NOT NULL,
  ref_id TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_xp_events_user_id_created_at ON user_xp_events(user_id, created_at);

CREATE TABLE IF NOT EXISTS listening_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_seconds INTEGER,
  mood TEXT,
  time_of_day TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_listening_events_user_id_created_at ON listening_events(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_listening_events_track_id ON listening_events(track_id);

CREATE TABLE IF NOT EXISTS user_ai_profiles (
  user_id TEXT PRIMARY KEY,
  personality_label TEXT,
  personality_description TEXT,
  taste_summary TEXT,
  model_version TEXT,
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recommendation_runs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mood TEXT,
  time_of_day TEXT,
  algorithm TEXT NOT NULL,
  request_json TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_recommendation_runs_user_id_created_at ON recommendation_runs(user_id, created_at);

CREATE TABLE IF NOT EXISTS recommendation_items (
  run_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  rank INTEGER NOT NULL,
  score REAL,
  reason TEXT,
  PRIMARY KEY (run_id, track_id),
  FOREIGN KEY (run_id) REFERENCES recommendation_runs(id) ON DELETE CASCADE,
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO badges (id, code, name, description, category, points, criteria_json)
VALUES
  ('badge_first_like', 'FIRST_LIKE', 'Primeiro Like', 'Favoritou a primeira música', 'engagement', 10, '{"type":"favorite_tracks_count","min":1}'),
  ('badge_10_listens', 'TEN_LISTENS', '10 Plays', 'Escutou 10 músicas', 'listening', 20, '{"type":"tracks_listened","min":10}'),
  ('badge_friend_made', 'FIRST_FRIEND', 'Primeira Amizade', 'Fez a primeira amizade', 'social', 20, '{"type":"friends_count","min":1}');
