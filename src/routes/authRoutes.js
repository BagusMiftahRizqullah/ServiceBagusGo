const express = require('express')
const { asyncHandler } = require('../utils/asyncHandler')
const authController = require('../controllers/authController')
const { validateBody } = require('../middlewares/validate')

const router = express.Router()

function validateAuthBody(body) {
  if (!body || typeof body !== 'object') return 'Invalid body'
  if (!body.phone_number || typeof body.phone_number !== 'string') return 'phone_number is required'
  if (!body.password || typeof body.password !== 'string') return 'password is required'
  return null
}

router.post('/register', validateBody(validateAuthBody), asyncHandler(authController.register))
router.post('/login', validateBody(validateAuthBody), asyncHandler(authController.login))

module.exports = { authRoutes: router }

