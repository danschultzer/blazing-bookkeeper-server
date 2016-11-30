/* eslint-env mocha */
var mockgoose = require('mockgoose')
var mongoose = require('mongoose')
global.StubSmtpTransporter = require('./stub_smtp_transporter')

before(function (done) {
  mockgoose(mongoose).then(function () {
    require('../config/config')('test-db', 'example.org')
    global.config.smtpTransporter = global.StubSmtpTransporter
    done()
  })
})

afterEach(function (done) {
  mockgoose.reset(function () {
    done()
  })
})

beforeEach(function () {
  global.StubSmtpTransporter.reset()
})
