const authService = require('../services/authService')

async function register(req, res) {
  const { user, token } = await authService.register(req.body)
  res.status(201).json({ status: 'success', token, user })
}

async function login(req, res) {
  const { token } = await authService.login(req.body)
  res.json({ status: 'success', token })
}

module.exports = { register, login }

