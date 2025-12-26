const express = require('express')

const catalogController = require('../../controllers/catalogController')
const { requireAuth } = require('../../middlewares/requireAuth')

const router = express.Router()

router.post('/artists', requireAuth, catalogController.createArtist)
router.get('/artists', requireAuth, catalogController.listArtists)

router.post('/genres', requireAuth, catalogController.createGenre)
router.get('/genres', requireAuth, catalogController.listGenres)

router.post('/tracks/:id/genres', requireAuth, catalogController.addTrackGenre)
router.delete('/tracks/:id/genres/:genreId', requireAuth, catalogController.deleteTrackGenre)

router.get('/tracks/:id/context-tags', requireAuth, catalogController.listTrackContextTags)
router.post('/tracks/:id/context-tags', requireAuth, catalogController.upsertTrackContextTag)
router.delete('/tracks/:id/context-tags', requireAuth, catalogController.deleteTrackContextTag)

router.post('/albums', requireAuth, catalogController.createAlbum)
router.get('/albums', requireAuth, catalogController.listAlbums)
router.get('/albums/:id', requireAuth, catalogController.getAlbum)

router.post('/tracks', requireAuth, catalogController.createTrack)
router.get('/tracks', requireAuth, catalogController.listTracks)
router.get('/tracks/:id', requireAuth, catalogController.getTrack)

router.post('/tracks/:id/favorite', requireAuth, catalogController.favoriteTrack)
router.delete('/tracks/:id/favorite', requireAuth, catalogController.unfavoriteTrack)
router.get('/me/favorites/tracks', requireAuth, catalogController.listMyFavoriteTracks)

router.post('/albums/:id/save', requireAuth, catalogController.saveAlbum)
router.delete('/albums/:id/save', requireAuth, catalogController.unsaveAlbum)
router.get('/me/saved/albums', requireAuth, catalogController.listMySavedAlbums)

router.post('/playlists', requireAuth, catalogController.createPlaylist)
router.get('/playlists', requireAuth, catalogController.listPlaylists)
router.get('/playlists/:id', requireAuth, catalogController.getPlaylist)
router.post('/playlists/:id/tracks', requireAuth, catalogController.addPlaylistTrack)
router.delete('/playlists/:id/items/:itemId', requireAuth, catalogController.deletePlaylistItem)

module.exports = router
