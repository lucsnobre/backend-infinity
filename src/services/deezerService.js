const axios = require('axios');

const DEEZER_API_BASE = 'https://api.deezer.com';

class DeezerService {
  constructor() {
    this.client = axios.create({
      baseURL: DEEZER_API_BASE,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'InfinityPlay/1.0'
      }
    });
  }

  async fetchFromDeezer(path) {
    try {
      const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
      const response = await this.client.get(normalizedPath);
      return response.data;
    } catch (error) {
      console.error('Deezer API Error:', error.message);
      throw new Error(`Failed to fetch from Deezer API: ${error.message}`);
    }
  }

  async getTopTracks(limit = 20) {
    const data = await this.fetchFromDeezer(`chart/0/tracks?limit=${limit}`);
    return data.data || [];
  }

  async getTopAlbums(limit = 20) {
    const data = await this.fetchFromDeezer(`chart/0/albums?limit=${limit}`);
    return data.data || [];
  }

  async getTopArtists(limit = 20) {
    const data = await this.fetchFromDeezer(`chart/0/artists?limit=${limit}`);
    return data.data || [];
  }

  async getAlbumDetails(id) {
    return await this.fetchFromDeezer(`album/${id}`);
  }

  async searchTracks(query, limit = 20) {
    const q = encodeURIComponent(query);
    const data = await this.fetchFromDeezer(`search/track?q=${q}&limit=${limit}`);
    return data.data || [];
  }

  async searchAlbums(query, limit = 20) {
    const q = encodeURIComponent(query);
    const data = await this.fetchFromDeezer(`search/album?q=${q}&limit=${limit}`);
    return data.data || [];
  }

  async getTrapFunkTracks(limit = 30) {
    const artistQueries = [
      'alee',
      'veigh',
      'niink',
      'mc ig',
      'ryu, the runner',
      'kayblack',
      'tz da coronel',
      'lpt zlatan',
      'matue',
      'teto',
      'wiu',
      'bradockdan',
      'emite unico',
    ];

    const perArtistLimit = Math.min(30, limit);
    
    try {
      const resultsArrays = await Promise.all(
        artistQueries.map((name) => this.searchTracks(name, perArtistLimit))
      );

      const byId = new Map();

      for (const list of resultsArrays) {
        for (const track of list) {
          if (!byId.has(track.id)) {
            byId.set(track.id, track);
          }
        }
      }

      return Array.from(byId.values()).slice(0, limit);
    } catch (error) {
      console.error('Error fetching trap/funk tracks:', error);
      return [];
    }
  }

  async getTrapFunkAlbums(limit = 30) {
    const artistQueries = [
      'mc cabelinho',
      'veigh',
      'niink',
      'mc ig',
      'mc ryan sp',
      'kayblack',
      'tz da coronel',
      'borges',
      'matue',
      'teto',
      'wiu',
    ];

    const perArtistLimit = Math.min(30, limit);
    
    try {
      const resultsArrays = await Promise.all(
        artistQueries.map((name) => this.searchAlbums(name, perArtistLimit))
      );

      const byId = new Map();

      for (const list of resultsArrays) {
        for (const album of list) {
          if (!byId.has(album.id)) {
            byId.set(album.id, album);
          }
        }
      }

      return Array.from(byId.values()).slice(0, limit);
    } catch (error) {
      console.error('Error fetching trap/funk albums:', error);
      return [];
    }
  }
}

module.exports = new DeezerService();
