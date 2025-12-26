const { v4: uuidv4 } = require('uuid')

const aiDao = require('../models/dao/aiDao')
const catalogDao = require('../models/dao/catalogDao')

function computeTimeOfDay(date) {
  const h = date.getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 18) return 'afternoon'
  if (h >= 18 && h < 23) return 'evening'
  return 'night'
}

function maybeGrantBadges(userId) {
  const favoritesCount = aiDao.countFavorites(userId)
  const listensCount = aiDao.getTracksListened(userId)

  if (favoritesCount >= 1) {
    aiDao.grantBadge(userId, 'badge_first_like')
  }

  if (listensCount >= 10) {
    aiDao.grantBadge(userId, 'badge_10_listens')
  }

  const friendsCount = aiDao.countFriends(userId)
  if (friendsCount >= 1) {
    aiDao.grantBadge(userId, 'badge_friend_made')
  }
}

function getProfile(req, res) {
  const profile = aiDao.getAiProfile(req.user.id)
  return res.json({ profile: profile || null })
}

function upsertProfile(req, res) {
  const { personalityLabel, personalityDescription, tasteSummary, modelVersion } = req.body || {}

  const profile = aiDao.upsertAiProfile({
    userId: req.user.id,
    personalityLabel,
    personalityDescription,
    tasteSummary,
    modelVersion,
  })

  return res.json({ profile })
}

function createListeningEvent(req, res) {
  const { trackId, startedAt, endedAt, durationSeconds, mood, timeOfDay } = req.body || {}
  if (!trackId || !startedAt) {
    return res.status(400).json({ error: 'missing_fields' })
  }

  const track = catalogDao.getTrackById(trackId)
  if (!track) {
    return res.status(404).json({ error: 'track_not_found' })
  }

  const id = uuidv4()
  const computedTimeOfDay = timeOfDay || computeTimeOfDay(new Date())

  const tx = aiDao.transaction(() => {
    const event = aiDao.insertListeningEvent({
      id,
      userId: req.user.id,
      trackId,
      startedAt,
      endedAt,
      durationSeconds,
      mood,
      timeOfDay: computedTimeOfDay,
    })

    aiDao.ensureUserStats(req.user.id)

    aiDao.incrementUserListeningStats({ userId: req.user.id, eventId: id })

    maybeGrantBadges(req.user.id)

    return event
  })

  const event = tx()
  return res.status(201).json({ event })
}

function requestRecommendations(req, res) {
  const { mood, timeOfDay, limit } = req.body || {}
  const max = Math.max(1, Math.min(50, Number(limit) || 20))

  const genreIds = aiDao.getFavoriteGenreIds(req.user.id, 5)

  let tracks = []

  if (mood && timeOfDay) {
    tracks = aiDao.findTracksByContextAndGenres({ mood, timeOfDay, genreIds, limit: max })
  }

  if (tracks.length === 0) {
    tracks = aiDao.findTracksByGenres({ genreIds, limit: max })
  }

  const runId = uuidv4()
  const tx = aiDao.transaction(() => {
    aiDao.insertRecommendationRun({
      id: runId,
      userId: req.user.id,
      mood,
      timeOfDay,
      algorithm: 'heuristic_v1',
      requestJson: JSON.stringify({ mood, timeOfDay, limit: max }),
    })

    for (let i = 0; i < tracks.length; i += 1) {
      aiDao.insertRecommendationItem({
        runId,
        trackId: tracks[i].id,
        rank: i + 1,
        score: null,
        reason: 'context+preferences',
      })
    }
  })

  tx()

  return res.json({ runId, tracks })
}

module.exports = {
  getProfile,
  upsertProfile,
  createListeningEvent,
  requestRecommendations,
}
