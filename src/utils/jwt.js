const jwt = require('jsonwebtoken')
const { env } = require('../config/env')

function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' })
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_SECRET)
}

module.exports = { signAccessToken, verifyAccessToken }

