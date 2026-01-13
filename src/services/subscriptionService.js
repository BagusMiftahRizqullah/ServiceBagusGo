const { prisma } = require('../prisma/client')
const { addDays } = require('../utils/dates')

const PLANS = {
  monthly: { durationDays: 30, priceIdr: 99000 },
  yearly: { durationDays: 365, priceIdr: 1200000 }
}

async function subscribe(userId, subscription_type) {
  const plan = PLANS[subscription_type]
  if (!plan) {
    const err = new Error('Invalid subscription_type')
    err.statusCode = 400
    throw err
  }

  const now = new Date()
  const end = addDays(now, plan.durationDays)

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      subscription_type,
      subscription_start_date: now,
      subscription_end_date: end
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

  return user
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
  if (!user) {
    const err = new Error('User not found')
    err.statusCode = 404
    throw err
  }
  return user
}

module.exports = { subscribe, getMe }

