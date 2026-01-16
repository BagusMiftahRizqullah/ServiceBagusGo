const express = require('express')
const { asyncHandler } = require('../utils/asyncHandler')
const subscriptionController = require('../controllers/subscriptionController')
const { authMiddleware } = require('../middlewares/auth')
const { validateBody } = require('../middlewares/validate')

const router = express.Router()

function validateSubscribeBody(body) {
  if (!body || typeof body !== 'object') return 'Invalid body'
  if (!body.subscription_type || typeof body.subscription_type !== 'string') {
    return 'subscription_type is required'
  }
  if (!['daily', 'monthly'].includes(body.subscription_type)) {
    return 'subscription_type must be daily or monthly'
  }
  return null
}

router.get('/me', authMiddleware, asyncHandler(subscriptionController.me))
router.post(
  '/subscribe',
  authMiddleware,
  validateBody(validateSubscribeBody),
  asyncHandler(subscriptionController.subscribe)
)

module.exports = { subscriptionRoutes: router }
