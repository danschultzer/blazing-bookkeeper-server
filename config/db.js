module.exports = function (dbname, hostname) {
  var mongoose = require('mongoose')
  mongoose.connect('mongodb://' + hostname + '/' + dbname || 'blazing-bookkeeper')

  return mongoose
}
