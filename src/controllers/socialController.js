const { v4: uuidv4 } = require('uuid')

const socialDao = require('../models/dao/socialDao')
const catalogDao = require('../models/dao/catalogDao')

function createFriendRequest(req, res) {
  const { toUserId } = req.body || {}
  if (!toUserId) {
    return res.status(400).json({ error: 'missing_fields' })
  }

  if (toUserId === req.user.id) {
    return res.status(400).json({ error: 'invalid_target' })
  }

  const toUser = socialDao.userExists(toUserId)
  if (!toUser) {
    return res.status(404).json({ error: 'user_not_found' })
  }

  const existing = socialDao.getFriendshipByPair(req.user.id, toUserId)
  if (existing) {
    return res.status(409).json({ error: 'friendship_exists', friendship: existing })
  }

  const id = uuidv4()
  const friendship = socialDao.insertFriendRequest({
    id,
    userA: req.user.id,
    userB: toUserId,
    initiatedBy: req.user.id,
  })

  return res.status(201).json({ friendship })
}

function acceptFriendRequest(req, res) {
  const friendship = socialDao.getFriendshipById(req.params.id)
  if (!friendship) {
    return res.status(404).json({ error: 'not_found' })
  }

  if (![friendship.user_low_id, friendship.user_high_id].includes(req.user.id)) {
    return res.status(403).json({ error: 'forbidden' })
  }

  if (friendship.status !== 'pending') {
    return res.status(409).json({ error: 'invalid_state' })
  }

  const updated = socialDao.updateFriendshipStatus({ id: req.params.id, status: 'accepted' })
  return res.json({ friendship: updated })
}

function rejectFriendRequest(req, res) {
  const friendship = socialDao.getFriendshipById(req.params.id)
  if (!friendship) {
    return res.status(404).json({ error: 'not_found' })
  }

  if (![friendship.user_low_id, friendship.user_high_id].includes(req.user.id)) {
    return res.status(403).json({ error: 'forbidden' })
  }

  if (friendship.status !== 'pending') {
    return res.status(409).json({ error: 'invalid_state' })
  }

  const updated = socialDao.updateFriendshipStatus({ id: req.params.id, status: 'rejected' })
  return res.json({ friendship: updated })
}

function listFriends(req, res) {
  const friendships = socialDao.listFriends(req.user.id)
  return res.json({ friendships })
}

function createRoom(req, res) {
  const { name, isPublic } = req.body || {}
  if (!name) {
    return res.status(400).json({ error: 'missing_fields' })
  }

  const id = uuidv4()

  const room = socialDao.insertRoom({
    id,
    ownerUserId: req.user.id,
    name,
    isPublic,
  })

  socialDao.insertRoomMember({ roomId: id, userId: req.user.id, role: 'owner' })
  socialDao.insertRoomEvent({
    id: uuidv4(),
    roomId: id,
    userId: req.user.id,
    type: 'room_created',
    payloadJson: JSON.stringify({ name, isPublic: !!isPublic }),
  })

  return res.status(201).json({ room })
}

function joinRoom(req, res) {
  const room = socialDao.getRoomById(req.params.id)
  if (!room) {
    return res.status(404).json({ error: 'not_found' })
  }

  socialDao.insertRoomMember({ roomId: req.params.id, userId: req.user.id, role: 'member' })
  socialDao.insertRoomEvent({
    id: uuidv4(),
    roomId: req.params.id,
    userId: req.user.id,
    type: 'member_joined',
    payloadJson: JSON.stringify({ userId: req.user.id }),
  })

  return res.status(204).send()
}

function leaveRoom(req, res) {
  socialDao.deleteRoomMember({ roomId: req.params.id, userId: req.user.id })
  socialDao.insertRoomEvent({
    id: uuidv4(),
    roomId: req.params.id,
    userId: req.user.id,
    type: 'member_left',
    payloadJson: JSON.stringify({ userId: req.user.id }),
  })

  return res.status(204).send()
}

function getRoom(req, res) {
  const room = socialDao.getRoomById(req.params.id)
  if (!room) {
    return res.status(404).json({ error: 'not_found' })
  }

  const members = socialDao.listRoomMembers(req.params.id)
  const queue = socialDao.listRoomQueue(req.params.id)
  return res.json({ room, members, queue })
}

function addRoomQueueItem(req, res) {
  const { trackId } = req.body || {}
  if (!trackId) {
    return res.status(400).json({ error: 'missing_fields' })
  }

  const room = socialDao.getRoomById(req.params.id)
  if (!room) {
    return res.status(404).json({ error: 'not_found' })
  }

  const isMember = socialDao.isRoomMember({ roomId: req.params.id, userId: req.user.id })
  if (!isMember) {
    return res.status(403).json({ error: 'not_room_member' })
  }

  const track = catalogDao.getTrackById(trackId)
  if (!track) {
    return res.status(404).json({ error: 'track_not_found' })
  }

  const id = uuidv4()
  const item = socialDao.insertRoomQueueItem({
    id,
    roomId: req.params.id,
    trackId,
    addedByUserId: req.user.id,
  })

  socialDao.insertRoomEvent({
    id: uuidv4(),
    roomId: req.params.id,
    userId: req.user.id,
    type: 'queue_added',
    payloadJson: JSON.stringify({ queueItemId: id, trackId }),
  })

  return res.status(201).json({ item })
}

function listRoomEvents(req, res) {
  const since = String(req.query.since || '').trim()
  const events = socialDao.listRoomEvents({ roomId: req.params.id, since: since || null })
  return res.json({ events })
}

module.exports = {
  createFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  listFriends,
  createRoom,
  joinRoom,
  leaveRoom,
  getRoom,
  addRoomQueueItem,
  listRoomEvents,
}
