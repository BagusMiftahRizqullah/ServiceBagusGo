const subscriptionService = require('../services/subscriptionService')

async function subscribe(req, res) {
  const userId = req.user.id
  const user = await subscriptionService.subscribe(userId, req.body.subscription_type)
  res.json({ status: 'success', data: user })
}

async function me(req, res) {
  const userId = req.user.id
  const user = await subscriptionService.getMe(userId)
  res.json({ status: 'success', data: user })
}

module.exports = { subscribe, me }

