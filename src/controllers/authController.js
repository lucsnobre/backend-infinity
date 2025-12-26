const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')

const MESSAGE = require('../config/messages')
const usersDao = require('../models/dao/usersDao')

function register(req, res) {
  const { email, username, password, displayName } = req.body || {}

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'missing_fields' })
  }

  const existing = usersDao.findUserByEmailOrUsername(email, username)
  if (existing) {
    return res.status(409).json({ error: 'user_exists' })
  }

  const id = uuidv4()
  const passwordHash = bcrypt.hashSync(password, 10)

  usersDao.insertUser({
    id,
    email,
    username,
    passwordHash,
    displayName,
  })

  usersDao.ensureUserStats(id)
  usersDao.ensureUserAiProfile(id)

  const token = jwt.sign({ sub: id }, process.env.JWT_SECRET || 'dev-secret-change-me', {
    expiresIn: '30d',
  })

  return res.status(201).json({
    status: true,
    status_code: 201,
    message: MESSAGE.SUCCESS_CREATED_ITEM.message,
    token,
  })
}

function login(req, res) {
  const { emailOrUsername, password } = req.body || {}
  if (!emailOrUsername || !password) {
    return res.status(400).json({ error: 'missing_fields' })
  }

  const user = usersDao.findUserAuthByEmailOrUsername(emailOrUsername)
  if (!user) {
    return res.status(401).json({ error: 'invalid_credentials' })
  }

  const ok = bcrypt.compareSync(password, user.password_hash)
  if (!ok) {
    return res.status(401).json({ error: 'invalid_credentials' })
  }

  usersDao.touchUserAfterLogin(user.id)

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET || 'dev-secret-change-me', {
    expiresIn: '30d',
  })

  return res.json({
    status: true,
    status_code: 200,
    token,
  })
}

module.exports = {
  register,
  login,
}
