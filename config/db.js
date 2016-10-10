module.exports = function (config) {
  var mongoose = require('mongoose');
  mongoose.connect('mongodb://localhost/' + config.dbname || 'blazing-bookkeeper');

  return mongoose;
};
