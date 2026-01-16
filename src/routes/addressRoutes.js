const express = require('express')
const { asyncHandler } = require('../utils/asyncHandler')
const addressController = require('../controllers/addressController')
const { authMiddleware } = require('../middlewares/auth')
const { validateBody } = require('../middlewares/validate')

const router = express.Router()

function validateCreateBody(body) {
  if (!body || typeof body !== 'object') return 'Invalid body'
  if (!body.address || typeof body.address !== 'string' || !body.address.trim()) {
    return 'address is required'
  }
  if (typeof body.lat !== 'number' || Number.isNaN(body.lat)) {
    return 'lat must be a valid number'
  }
  if (typeof body.lng !== 'number' || Number.isNaN(body.lng)) {
    return 'lng must be a valid number'
  }
  return null
}

function validateUpdateBody(body) {
  if (!body || typeof body !== 'object') return 'Invalid body'
  if (
    body.address === undefined &&
    body.lat === undefined &&
    body.lng === undefined
  ) {
    return 'at least one of address, lat, or lng must be provided'
  }
  if (body.address !== undefined) {
    if (typeof body.address !== 'string' || !body.address.trim()) {
      return 'address must be a non-empty string when provided'
    }
  }
  if (body.lat !== undefined) {
    if (typeof body.lat !== 'number' || Number.isNaN(body.lat)) {
      return 'lat must be a valid number when provided'
    }
  }
  if (body.lng !== undefined) {
    if (typeof body.lng !== 'number' || Number.isNaN(body.lng)) {
      return 'lng must be a valid number when provided'
    }
  }
  return null
}

router.use(authMiddleware)

router.post('/', validateBody(validateCreateBody), asyncHandler(addressController.create))
router.get('/', asyncHandler(addressController.list))
router.get('/:id', asyncHandler(addressController.getOne))
router.put('/:id', validateBody(validateUpdateBody), asyncHandler(addressController.update))
router.delete('/:id', asyncHandler(addressController.remove))

module.exports = { addressRoutes: router }

