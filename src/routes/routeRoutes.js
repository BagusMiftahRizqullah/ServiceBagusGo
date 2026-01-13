const express = require('express')
const { asyncHandler } = require('../utils/asyncHandler')
const routeController = require('../controllers/routeController')
const { authMiddleware } = require('../middlewares/auth')
const { subscriptionMiddleware } = require('../middlewares/subscription')
const { validateBody } = require('../middlewares/validate')

const router = express.Router()

function validateOptimizeBody(body) {
  if (!body || typeof body !== 'object') return 'Invalid body'
  if (!body.origin || typeof body.origin !== 'object') return 'origin is required'
  if (typeof body.origin.lat !== 'number' || typeof body.origin.lng !== 'number') {
    return 'origin.lat and origin.lng must be numbers'
  }
  if (!Array.isArray(body.destinations) || body.destinations.length < 2) {
    return 'destinations must be an array with more than one address'
  }
  for (const d of body.destinations) {
    if (typeof d !== 'string' || !d.trim()) {
      return 'each destination must be a non-empty string'
    }
  }
  return null
}

router.post(
  '/optimize-route',
  authMiddleware,
  asyncHandler(subscriptionMiddleware),
  validateBody(validateOptimizeBody),
  asyncHandler(routeController.optimizeRoute)
)

module.exports = { routeRoutes: router }
