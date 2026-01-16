const express = require('express')
const cors = require('cors')
const path = require('path')
const { authRoutes } = require('./routes/authRoutes')
const { subscriptionRoutes } = require('./routes/subscriptionRoutes')
const { routeRoutes } = require('./routes/routeRoutes')
const { errorHandler } = require('./middlewares/errorHandler')
const swaggerUi = require('swagger-ui-express')
const { swaggerSpec } = require('./config/swagger')

const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/download/apk', (req, res, next) => {
  // check
  const filePath = path.join(__dirname, 'public', 'BagusGo-V1.3.apk')
  res.download(filePath, 'BagusGo-V1.3.apk', (err) => {
    if (err) {
      return next(err)
    }
  })
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }))

app.use('/api/auth', authRoutes)
app.use('/api/subscription', subscriptionRoutes)
app.use('/api', routeRoutes)

app.use(errorHandler)

module.exports = { app }
