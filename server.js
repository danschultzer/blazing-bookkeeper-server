module.exports = function () {
  var express = require('express')
  var path = require('path')
  var RateLimit = require('express-rate-limit')

  var app = express()

  // Github admin authorization
  app.use('/', require('./controllers/auth_github')())

  // Throttle API requests
  var apiLimiter = new RateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  })
  app.use('/api/', apiLimiter)

  // API
  var authenticate = require('./middlewares/api_auth.js')()
  app.use('/api/v1', require('./controllers/api_breakpad')(authenticate))
  app.use('/api/v1', require('./controllers/api_bug_report')(authenticate))
  app.use('/api/v1', require('./controllers/api_receipt')(authenticate))

  // Static assets handling
  app.use(express.static(path.join(__dirname, 'public')))

  // Error handler
  var clientErrorHandler = require('./middlewares/client_error_handler.js')
  app.use(clientErrorHandler)

  // Return not found on everything else
  app.all('*', function (req, res, next) {
    res.status(404)
    res.send({ error: 'Resource not found' })
  })

  return app
}
