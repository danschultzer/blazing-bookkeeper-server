module.exports = exports = function (dbname) {
  var config = require('./config.json')
  var node_env = process.env.NODE_ENV || 'production'
  config.env = node_env
  config.smtpTransporter = require('./transporter')
  config.db = require('./db')(dbname || config.dbname, 'localhost')

  global.config = config

  return global.config
}
