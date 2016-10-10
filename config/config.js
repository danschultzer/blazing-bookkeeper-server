module.exports = exports = function () {
  var config = require('./config.json');
  var node_env = process.env.NODE_ENV || 'production';
  config.env = node_env;
  return config;
};
