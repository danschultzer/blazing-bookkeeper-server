module.exports = function () {
  var express = require('express')
  var router = express.Router()
  var passport = require('passport')
  var Strategy = require('passport-github2')
  var Admin = require('../models/admin')
  var request = require('request')

  router.use(passport.initialize())
  passport.serializeUser(function (admin, done) {
    done(null, admin._id)
  })
  passport.deserializeUser(function (id, done) {
    Admin.findById(id, function (err, admin) {
      done(err, admin)
    })
  })

  passport.use(new Strategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'clientID',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'clientSecret',
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/auth/github/callback'
  },
      function (accessToken, refreshToken, profile, cb) {
        getEmail(accessToken, function (error, email) {
          if (error) return cb(error)

          hasRepo(profile, function (error) {
            if (error) return cb(error)

            var options = {
              github_id: profile.id,
              access_token: accessToken,
              email: email
            }
            Admin.findOneAndUpdate({ github_id: profile.id }, options, { new: true }, function (error, admin) {
              if (error) return cb(error)

              if (!admin) {
                admin = Admin(options)
                admin.save(function (error) {
                  cb(error, admin)
                })
              } else {
                cb(error, admin)
              }
            })
          })
        })
      }
    ))

  router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }))

  router.get('/auth/github/callback',
    passport.authenticate('github'),
    function (req, res) {
      res.send({ token: req.user.accessToken })
      res.close()
    })

  function hasRepo (profile, cb) {
    var options = {
      url: 'https://api.github.com/repos/danschultzer/blazing-bookkeeper/contributors',
      headers: {
        'User-Agent': 'Blazing Bookkeeper Server'
      },
      json: true
    }
    request.get(options, function (error, response, json) {
      if (error) return cb(error)

      if (response.statusCode !== 200) {
        return cb(new Error('Invalid response'))
      }

      var isMember = false

      for (var i = 0; i < json.length; i++) {
        if (json[i].id === profile.id) {
          isMember = true
          break
        }
      }

      if (!isMember) {
        return cb(new Error('Not contributor for danschultzer/blazing-bookkeeper'))
      }

      cb()
    })
  }

  function getEmail (accessToken, cb) {
    var options = {
      url: 'https://api.github.com/user/emails',
      headers: {
        'User-Agent': 'Blazing Bookkeeper Server',
        'Authorization': 'token ' + accessToken
      },
      json: true
    }

    request(options, function (error, response, json) {
      if (error) return cb(error)

      if (response.statusCode !== 200) {
        return cb(new Error('Invalid response'))
      }

      var emails = json.filter(function (email) {
        return email.verified && email.primary
      })

      if (!emails.length) {
        return cb(new Error('No verified primary email found for user'))
      }

      cb(error, emails[0].email)
    })
  }

  return router
}
