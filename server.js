module.exports = function (db, cb) {
  var express = require('express'),
    path = require('path'),
    RateLimit = require('express-rate-limit');

  var app = express();

  // Github admin authorization
  app.use('/', require('./controllers/auth_github')());

  // Throttle API requests
  var apiLimiter = new RateLimit({
    windowMs: 15*60*1000,
    max: 100
  });
  app.use('/api/', apiLimiter);

  // API
  authenticate = require('./middlewares/api_auth.js')();
  app.use('/api/v1', require('./controllers/api_breakpad')(db, authenticate));
  app.use('/api/v1', require('./controllers/api_bug_report')(db, authenticate));

  // Static assets handling
  app.use(express.static(path.join(__dirname, 'public')));

  // Error handler
  clientErrorHandler = require('./middlewares/client_error_handler.js');
  app.use(clientErrorHandler);

  // Return not found on everything else
  app.all('*', function (req, res, next) {
    res.status(404);
    res.send({ error: 'Resource not found' });
  });

  cb(app);
};
