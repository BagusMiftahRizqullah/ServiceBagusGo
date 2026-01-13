const bcrypt = require('bcryptjs')
const { prisma } = require('../prisma/client')
const { addDays } = require('../utils/dates')
const { normalizePhoneNumber } = require('../utils/phone')
const { signAccessToken } = require('../utils/jwt')

async function register({ phone_number, password }) {
  const phone = normalizePhoneNumber(phone_number)
  if (!phone) {
    const err = new Error('phone_number is required')
    err.statusCode = 400
    throw err
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    const err = new Error('password must be at least 6 characters')
    err.statusCode = 400
    throw err
  }

  const existing = await prisma.user.findUnique({ where: { phone_number: phone } })
  if (existing) {
    const err = new Error('phone_number already registered')
    err.statusCode = 409
    throw err
  }

  const now = new Date()
  const trialEnd = addDays(now, 30)
  const hashed = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      phone_number: phone,
      password: hashed,
      trial_start_date: now,
      trial_end_date: trialEnd,
      subscription_type: 'free'
    },
    select: {
      id: true,
      phone_number: true,
      trial_start_date: true,
      trial_end_date: true,
      subscription_type: true,
      subscription_start_date: true,
      subscription_end_date: true,
      created_at: true,
      updated_at: true
    }
  })

  const token = signAccessToken({ userId: user.id })
  return { user, token }
}

async function login({ phone_number, password }) {
  const phone = normalizePhoneNumber(phone_number)
  if (!phone || !password) {
    const err = new Error('phone_number and password are required')
    err.statusCode = 400
    throw err
  }

  const user = await prisma.user.findUnique({ where: { phone_number: phone } })
  if (!user) {
    const err = new Error('Invalid credentials')
    err.statusCode = 401
    throw err
  }

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) {
    const err = new Error('Invalid credentials')
    err.statusCode = 401
    throw err
  }

  const now = new Date()
  if (user.subscription_type === 'free') {
    // Check trial end date
    if (user.trial_end_date && now > user.trial_end_date) {
      const err = new Error('Trial period has ended. Please subscribe.')
      err.statusCode = 403
      throw err
    }
  } else {
    // Check subscription end date for non-free users
    if (user.subscription_end_date && now > user.subscription_end_date) {
      const err = new Error('Subscription has expired. Please renew.')
      err.statusCode = 403
      throw err
    }
  }

  const token = signAccessToken({ userId: user.id })
  return { token }
}

module.exports = { register, login }

