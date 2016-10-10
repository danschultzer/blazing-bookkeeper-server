module.exports = function() {
  var passport = require('passport'),
    Strategy = require('passport-http-bearer').Strategy,
    Admin = require('../models/admin');

  passport.use(new Strategy(
    function(token, cb) {
      Admin.findOne({ access_token: token }, function (error, admin) {
        if (error)
          return cb(error);

        if (!admin)
          return cb(null, false);

        return cb(null, admin, { scope: 'all' });
      });
    }
  ));

  return passport.authenticate('bearer', { session: false });
};
