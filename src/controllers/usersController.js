const usersDao = require('../models/dao/usersDao')

function getMe(req, res) {
  const user = usersDao.getMe(req.user.id)
  if (!user) {
    return res.status(404).json({ error: 'not_found' })
  }
  return res.json({ user })
}

function patchMe(req, res) {
  const { displayName, bio, timezone } = req.body || {}

  usersDao.updateMe({
    userId: req.user.id,
    displayName,
    bio,
    timezone,
  })

  const user = usersDao.getMe(req.user.id)
  return res.json({ user })
}

function search(req, res) {
  const q = String(req.query.q || '').trim()
  if (!q) {
    return res.json({ users: [] })
  }

  const users = usersDao.searchUsers(q)
  return res.json({ users })
}

function getById(req, res) {
  const user = usersDao.getPublicUserById(req.params.id)
  if (!user) {
    return res.status(404).json({ error: 'not_found' })
  }
  return res.json({ user })
}

module.exports = {
  getMe,
  patchMe,
  search,
  getById,
}
