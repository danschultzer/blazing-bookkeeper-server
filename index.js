var config = require('./config/config')();

var app = require('./server')();
app.listen(process.env.PORT || config.port, 'localhost');
