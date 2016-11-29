/* eslint-env mocha */
require('./spec_helper')
var Admin = require('../models/admin')

before(function () {
  global.server = require('../server')()
})

beforeEach(function (done) {
  global.adminUser = Admin({
    github_id: 'test',
    email: 'admin@example.org',
    access_token: 'test'
  })
  global.adminUser.save(function (error) {
    if (error) throw error
    done()
  })
})
