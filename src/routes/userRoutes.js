const express = require('express')
const { asyncHandler } = require('../utils/asyncHandler')
const userController = require('../controllers/userController')
const { authMiddleware } = require('../middlewares/auth')
const { validateBody } = require('../middlewares/validate')

const router = express.Router()

function validateCreateBody(body) {
  if (!body || typeof body !== 'object') return 'Invalid body'
  if (!body.phone_number || typeof body.phone_number !== 'string') {
    return 'phone_number is required'
  }
  if (!body.password || typeof body.password !== 'string') {
    return 'password is required'
  }
  return null
}

function validateUpdateBody(body) {
  if (!body || typeof body !== 'object') return 'Invalid body'
  if (
    body.phone_number === undefined &&
    body.password === undefined &&
    body.name === undefined
  ) {
    return 'at least one of phone_number, password, or name must be provided'
  }
  if (body.phone_number !== undefined && typeof body.phone_number !== 'string') {
    return 'phone_number must be a string when provided'
  }
  if (body.password !== undefined && typeof body.password !== 'string') {
    return 'password must be a string when provided'
  }
  if (body.name !== undefined && typeof body.name !== 'string') {
    return 'name must be a string when provided'
  }
  return null
}

router.use(authMiddleware)

router.get('/', asyncHandler(userController.list))
router.get('/:id', asyncHandler(userController.getOne))
router.post('/', validateBody(validateCreateBody), asyncHandler(userController.create))
router.put('/:id', validateBody(validateUpdateBody), asyncHandler(userController.update))
router.delete('/:id', asyncHandler(userController.remove))

module.exports = { userRoutes: router }

