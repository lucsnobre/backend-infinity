const { v4: uuidv4 } = require('uuid')

const catalogDao = require('../models/dao/catalogDao')

function createArtist(req, res) {
  const { name } = req.body || {}
  if (!name) {
    return res.status(400).json({ error: 'missing_fields' })
  }

  const id = uuidv4()
  const artist = catalogDao.insertArtist({ id, name })
  return res.status(201).json({ artist })
}

function listArtists(req, res) {
  const q = String(req.query.q || '').trim()
  const artists = catalogDao.listArtists(q || null)
  return res.json({ artists })
}

function createGenre(req, res) {
  const { name } = req.body || {}
  if (!name) {
    return res.status(400).json({ error: 'missing_fields' })
  }

  const id = uuidv4()
  try {
    const genre = catalogDao.insertGenre({ id, name })
    return res.status(201).json({ genre })
  } catch (err) {
    return res.status(409).json({ error: 'genre_exists' })
  }
}

function listGenres(req, res) {
  const q = String(req.query.q || '').trim()
  const genres = catalogDao.listGenres(q || null)
  return res.json({ genres })
}

function addTrackGenre(req, res) {
  const { genreId } = req.body || {}
  if (!genreId) {
    return res.status(400).json({ error: 'missing_fields' })
  }

  const track = catalogDao.getTrackById(req.params.id)
  if (!track) {
    return res.status(404).json({ error: 'track_not_found' })
  }

  const genre = catalogDao.getGenreById(genreId)
  if (!genre) {
    return res.status(404).json({ error: 'genre_not_found' })
  }

  catalogDao.addTrackGenre({ trackId: req.params.id, genreId })
  return res.status(204).send()
}

function deleteTrackGenre(req, res) {
  catalogDao.deleteTrackGenre({ trackId: req.params.id, genreId: req.params.genreId })
  return res.status(204).send()
}

function listTrackContextTags(req, res) {
  const tags = catalogDao.listTrackContextTags(req.params.id)
  return res.json({ tags })
}

function upsertTrackContextTag(req, res) {
  const { mood, timeOfDay, weight } = req.body || {}
  if (!mood || !timeOfDay) {
    return res.status(400).json({ error: 'missing_fields' })
  }

  const track = catalogDao.getTrackById(req.params.id)
  if (!track) {
    return res.status(404).json({ error: 'track_not_found' })
  }

  const w = Number.isFinite(Number(weight)) ? Number(weight) : 1.0
  const tag = catalogDao.upsertTrackContextTag({
    trackId: req.params.id,
    mood,
    timeOfDay,
    weight: w,
  })

  return res.status(201).json({ tag })
}

function deleteTrackContextTag(req, res) {
  const mood = String(req.query.mood || '').trim()
  const timeOfDay = String(req.query.timeOfDay || '').trim()

  if (!mood || !timeOfDay) {
    return res.status(400).json({ error: 'missing_fields' })
  }

  catalogDao.deleteTrackContextTag({ trackId: req.params.id, mood, timeOfDay })
  return res.status(204).send()
}

function createAlbum(req, res) {
  const { title, artistId, releaseDate, coverUrl } = req.body || {}
  if (!title) {
    return res.status(400).json({ error: 'missing_fields' })
  }

  const id = uuidv4()
  const album = catalogDao.insertAlbum({ id, title, artistId, releaseDate, coverUrl })
  return res.status(201).json({ album })
}

function listAlbums(req, res) {
  const q = String(req.query.q || '').trim()
  const albums = catalogDao.listAlbums(q || null)
  return res.json({ albums })
}

function getAlbum(req, res) {
  const album = catalogDao.getAlbumById(req.params.id)
  if (!album) {
    return res.status(404).json({ error: 'not_found' })
  }

  const tracks = catalogDao.listAlbumTracks(req.params.id)
  return res.json({ album, tracks })
}

function createTrack(req, res) {
  const { title, artistId, albumId, durationSeconds, audioUrl, coverUrl, explicit } = req.body || {}
  if (!title) {
    return res.status(400).json({ error: 'missing_fields' })
  }

  const id = uuidv4()
  const track = catalogDao.insertTrack({
    id,
    title,
    artistId,
    albumId,
    durationSeconds,
    audioUrl,
    coverUrl,
    explicit,
  })

  return res.status(201).json({ track })
}

function listTracks(req, res) {
  const q = String(req.query.q || '').trim()
  const tracks = catalogDao.listTracks(q || null)
  return res.json({ tracks })
}

function getTrack(req, res) {
  const track = catalogDao.getTrackDetails(req.params.id)
  if (!track) {
    return res.status(404).json({ error: 'not_found' })
  }

  const genres = catalogDao.listTrackGenres(req.params.id)
  return res.json({ track, genres })
}

function favoriteTrack(req, res) {
  const track = catalogDao.getTrackById(req.params.id)
  if (!track) {
    return res.status(404).json({ error: 'not_found' })
  }

  catalogDao.favoriteTrack({ userId: req.user.id, trackId: req.params.id })
  return res.status(204).send()
}

function unfavoriteTrack(req, res) {
  catalogDao.unfavoriteTrack({ userId: req.user.id, trackId: req.params.id })
  return res.status(204).send()
}

function listMyFavoriteTracks(req, res) {
  const tracks = catalogDao.listFavoriteTracks(req.user.id)
  return res.json({ tracks })
}

function saveAlbum(req, res) {
  const album = catalogDao.getAlbumById(req.params.id)
  if (!album) {
    return res.status(404).json({ error: 'not_found' })
  }

  catalogDao.saveAlbum({ userId: req.user.id, albumId: req.params.id })
  return res.status(204).send()
}

function unsaveAlbum(req, res) {
  catalogDao.unsaveAlbum({ userId: req.user.id, albumId: req.params.id })
  return res.status(204).send()
}

function listMySavedAlbums(req, res) {
  const albums = catalogDao.listSavedAlbums(req.user.id)
  return res.json({ albums })
}

function createPlaylist(req, res) {
  const { name, description, isPublic } = req.body || {}
  if (!name) {
    return res.status(400).json({ error: 'missing_fields' })
  }

  const id = uuidv4()
  const playlist = catalogDao.insertPlaylist({
    id,
    ownerUserId: req.user.id,
    name,
    description,
    isPublic,
  })

  return res.status(201).json({ playlist })
}

function listPlaylists(req, res) {
  const playlists = catalogDao.listPlaylists(req.user.id)
  return res.json({ playlists })
}

function getPlaylist(req, res) {
  const playlist = catalogDao.getPlaylistById(req.params.id)
  if (!playlist) {
    return res.status(404).json({ error: 'not_found' })
  }

  if (playlist.owner_user_id !== req.user.id && !playlist.is_public) {
    return res.status(403).json({ error: 'forbidden' })
  }

  const items = catalogDao.listPlaylistItems(req.params.id)
  return res.json({ playlist, items })
}

function addPlaylistTrack(req, res) {
  const { trackId, position } = req.body || {}
  if (!trackId) {
    return res.status(400).json({ error: 'missing_fields' })
  }

  const playlist = catalogDao.getPlaylistById(req.params.id)
  if (!playlist) {
    return res.status(404).json({ error: 'not_found' })
  }

  if (playlist.owner_user_id !== req.user.id) {
    return res.status(403).json({ error: 'forbidden' })
  }

  const track = catalogDao.getTrackById(trackId)
  if (!track) {
    return res.status(404).json({ error: 'track_not_found' })
  }

  const id = uuidv4()
  const item = catalogDao.insertPlaylistItem({
    id,
    playlistId: req.params.id,
    trackId,
    position,
    addedByUserId: req.user.id,
  })

  return res.status(201).json({ item })
}

function deletePlaylistItem(req, res) {
  const playlist = catalogDao.getPlaylistById(req.params.id)
  if (!playlist) {
    return res.status(404).json({ error: 'not_found' })
  }

  if (playlist.owner_user_id !== req.user.id) {
    return res.status(403).json({ error: 'forbidden' })
  }

  catalogDao.deletePlaylistItem({ playlistId: req.params.id, itemId: req.params.itemId })
  return res.status(204).send()
}

module.exports = {
  createArtist,
  listArtists,
  createGenre,
  listGenres,
  addTrackGenre,
  deleteTrackGenre,
  listTrackContextTags,
  upsertTrackContextTag,
  deleteTrackContextTag,
  createAlbum,
  listAlbums,
  getAlbum,
  createTrack,
  listTracks,
  getTrack,
  favoriteTrack,
  unfavoriteTrack,
  listMyFavoriteTracks,
  saveAlbum,
  unsaveAlbum,
  listMySavedAlbums,
  createPlaylist,
  listPlaylists,
  getPlaylist,
  addPlaylistTrack,
  deletePlaylistItem,
}
