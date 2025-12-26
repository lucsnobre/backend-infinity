const express = require('express')

const badgesController = require('../../controllers/badgesController')
const { requireAuth } = require('../../middlewares/requireAuth')

const router = express.Router()

router.get('/', requireAuth, badgesController.list)
router.get('/me', requireAuth, badgesController.listMe)

module.exports = router
