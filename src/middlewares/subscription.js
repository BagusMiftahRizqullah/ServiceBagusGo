const { prisma } = require('../prisma/client')
const { isActiveRange } = require('../utils/dates')

async function subscriptionMiddleware(req, res, next) {
  const userId = req.user && req.user.id
  if (!userId) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      trial_start_date: true,
      trial_end_date: true,
      subscription_start_date: true,
      subscription_end_date: true
    }
  })

  if (!user) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }

  const now = new Date()
  const trialActive = isActiveRange(now, user.trial_start_date, user.trial_end_date)
  const subscriptionActive = isActiveRange(
    now,
    user.subscription_start_date,
    user.subscription_end_date
  )

  if (!trialActive && !subscriptionActive) {
    return res
      .status(403)
      .json({ status: 'error', message: 'Trial/subscription is not active' })
  }

  return next()
}

module.exports = { subscriptionMiddleware }

