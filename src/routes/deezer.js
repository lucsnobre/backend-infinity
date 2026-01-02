const express = require('express');
const deezerService = require('../services/deezerService');

const router = express.Router();

// Get top tracks
router.get('/chart/0/tracks', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const tracks = await deezerService.getTopTracks(limit);
    res.json({ data: tracks });
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    res.status(500).json({ error: 'Failed to fetch top tracks' });
  }
});

// Get top albums
router.get('/chart/0/albums', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const albums = await deezerService.getTopAlbums(limit);
    res.json({ data: albums });
  } catch (error) {
    console.error('Error fetching top albums:', error);
    res.status(500).json({ error: 'Failed to fetch top albums' });
  }
});

// Get top artists
router.get('/chart/0/artists', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const artists = await deezerService.getTopArtists(limit);
    res.json({ data: artists });
  } catch (error) {
    console.error('Error fetching top artists:', error);
    res.status(500).json({ error: 'Failed to fetch top artists' });
  }
});

// Get album details
router.get('/album/:id', async (req, res) => {
  try {
    const album = await deezerService.getAlbumDetails(req.params.id);
    res.json(album);
  } catch (error) {
    console.error('Error fetching album details:', error);
    res.status(500).json({ error: 'Failed to fetch album details' });
  }
});

// Search tracks
router.get('/search/track', async (req, res) => {
  try {
    const query = req.query.q;
    const limit = parseInt(req.query.limit) || 20;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const tracks = await deezerService.searchTracks(query, limit);
    res.json({ data: tracks });
  } catch (error) {
    console.error('Error searching tracks:', error);
    res.status(500).json({ error: 'Failed to search tracks' });
  }
});

// Search albums
router.get('/search/album', async (req, res) => {
  try {
    const query = req.query.q;
    const limit = parseInt(req.query.limit) || 20;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const albums = await deezerService.searchAlbums(query, limit);
    res.json({ data: albums });
  } catch (error) {
    console.error('Error searching albums:', error);
    res.status(500).json({ error: 'Failed to search albums' });
  }
});

// Get trap/funk tracks (custom endpoint)
router.get('/trap-funk/tracks', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const tracks = await deezerService.getTrapFunkTracks(limit);
    res.json({ data: tracks });
  } catch (error) {
    console.error('Error fetching trap/funk tracks:', error);
    res.status(500).json({ error: 'Failed to fetch trap/funk tracks' });
  }
});

// Get trap/funk albums (custom endpoint)
router.get('/trap-funk/albums', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const albums = await deezerService.getTrapFunkAlbums(limit);
    res.json({ data: albums });
  } catch (error) {
    console.error('Error fetching trap/funk albums:', error);
    res.status(500).json({ error: 'Failed to fetch trap/funk albums' });
  }
});

// Generic proxy for any other Deezer endpoint
router.get('/*', async (req, res) => {
  try {
    const path = req.params[0];
    const queryString = new URLSearchParams(req.query).toString();
    const fullPath = queryString ? `${path}?${queryString}` : path;
    
    const data = await deezerService.fetchFromDeezer(fullPath);
    res.json(data);
  } catch (error) {
    console.error('Error proxying to Deezer:', error);
    res.status(500).json({ error: 'Failed to fetch from Deezer API' });
  }
});

module.exports = router;
