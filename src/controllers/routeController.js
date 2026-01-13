const routeService = require('../services/routeService')

async function optimizeRoute(req, res) {
  const { origin, destinations } = req.body
  const data = await routeService.optimizeRoute(origin, destinations)
  res.json({ status: 'success', data })
}

module.exports = { optimizeRoute }

