function validateBody(validator) {
  return (req, res, next) => {
    const error = validator(req.body)
    if (error) {
      return res.status(400).json({ status: 'error', message: error })
    }
    return next()
  }
}

module.exports = { validateBody }

