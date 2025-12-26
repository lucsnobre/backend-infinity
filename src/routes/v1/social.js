const express = require('express')

const socialController = require('../../controllers/socialController')
const { requireAuth } = require('../../middlewares/requireAuth')

const router = express.Router()

router.post('/friends/requests', requireAuth, socialController.createFriendRequest)
router.post('/friends/requests/:id/accept', requireAuth, socialController.acceptFriendRequest)
router.post('/friends/requests/:id/reject', requireAuth, socialController.rejectFriendRequest)
router.get('/friends', requireAuth, socialController.listFriends)

router.post('/rooms', requireAuth, socialController.createRoom)
router.post('/rooms/:id/join', requireAuth, socialController.joinRoom)
router.post('/rooms/:id/leave', requireAuth, socialController.leaveRoom)
router.get('/rooms/:id', requireAuth, socialController.getRoom)
router.post('/rooms/:id/queue', requireAuth, socialController.addRoomQueueItem)
router.get('/rooms/:id/events', requireAuth, socialController.listRoomEvents)

module.exports = router
