/* eslint-env mocha */
var proxyquire = require('proxyquire')
var mockgoose = require('mockgoose')
var mongoose = require('mongoose')
var StubTransporter = require('./stub_transporter')

beforeEach(function (done) {
  proxyquire('../helpers/send_report_to_admins', { '../config/transporter': StubTransporter })
  mockgoose(mongoose).then(function () {
    mongoose.connect('mongodb://localhost/test-db')
  })
  done()
})

after(function (done) {
  mockgoose.reset(function () {
    done()
  })
})
