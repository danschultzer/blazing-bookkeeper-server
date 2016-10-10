var config = require('./config/config')();
var db = require('./config/db')(config);

require('./server')(db, function (app) {
  app.listen(process.env.PORT || config.port, 'localhost');
});
