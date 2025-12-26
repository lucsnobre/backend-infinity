const badgesDao = require('../models/dao/badgesDao')

function list(req, res) {
  const badges = badgesDao.listBadges()
  return res.json({ badges })
}

function listMe(req, res) {
  const badges = badgesDao.listUserBadges(req.user.id)
  return res.json({ badges })
}

module.exports = {
  list,
  listMe,
}
