const express = require('express')

const usersController = require('../../controllers/usersController')
const { requireAuth } = require('../../middlewares/requireAuth')

const router = express.Router()

router.get('/me', requireAuth, usersController.getMe)
router.patch('/me', requireAuth, usersController.patchMe)
router.get('/search', requireAuth, usersController.search)
router.get('/:id', requireAuth, usersController.getById)

module.exports = router
