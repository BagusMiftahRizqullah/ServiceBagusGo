const { env } = require('./config/env')
const { app } = require('./app')

app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`Service BagusGo running on port ${env.PORT}`)
})

