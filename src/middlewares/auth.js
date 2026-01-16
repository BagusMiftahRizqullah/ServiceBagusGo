const { verifyAccessToken } = require('../utils/jwt')

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const [type, token] = header.split(' ')
  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, error: 'Unauthorized', code: 401, status: 'error' })
  }

  try {
    const decoded = verifyAccessToken(token)
    req.user = { id: decoded.userId }
    return next()
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Invalid token', code: 401, status: 'error' })
  }
}

module.exports = { authMiddleware }
