const express = require('express')

const aiController = require('../../controllers/aiController')
const { requireAuth } = require('../../middlewares/requireAuth')

const router = express.Router()

router.get('/profile', requireAuth, aiController.getProfile)
router.post('/profile', requireAuth, aiController.upsertProfile)
router.post('/events/listening', requireAuth, aiController.createListeningEvent)
router.post('/recommendations/request', requireAuth, aiController.requestRecommendations)

module.exports = router
