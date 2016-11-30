module.exports = exports = function (dbname) {
  var config = require('./config.json')
  config.env = process.env.NODE_ENV || 'production'
  config.smtpTransporter = require('./transporter')
  config.db = require('./db')(dbname || config.dbname, 'localhost')

  global.config = config

  return global.config
}
