const { verifyAccessToken } = require('../utils/jwt')

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const [type, token] = header.split(' ')
  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }

  try {
    const decoded = verifyAccessToken(token)
    req.user = { id: decoded.userId }
    return next()
  } catch (e) {
    return res.status(401).json({ status: 'error', message: 'Invalid token' })
  }
}

module.exports = { authMiddleware }

