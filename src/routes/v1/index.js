const express = require('express')

const authRoutes = require('./auth')
const usersRoutes = require('./users')
const catalogRoutes = require('./catalog')
const socialRoutes = require('./social')
const badgesRoutes = require('./badges')
const aiRoutes = require('./ai')

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/users', usersRoutes)
router.use('/catalog', catalogRoutes)
router.use('/social', socialRoutes)
router.use('/badges', badgesRoutes)
router.use('/ai', aiRoutes)

module.exports = router
