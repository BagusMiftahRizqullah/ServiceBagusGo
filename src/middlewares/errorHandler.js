function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500
  const payload = {
    success: false,
    error: err.message || 'Internal Server Error',
    code: statusCode,
    status: 'error'
  }
  if (process.env.NODE_ENV === 'development' && err.details) {
    payload.details = err.details
  }
  res.status(statusCode).json(payload)
}

module.exports = { errorHandler }
