/* eslint-env mocha */
var assert = require('chai').assert
var nodemailer = require('nodemailer')
var StubTransporter = require('../stub_transporter')()
var CrashReport = require('../../models/crash_report.js')
require('../spec_helper')

describe('Crash report', function () {
  before(function (done) {
    var transporter = nodemailer.createTransport(StubTransporter)
    transporter.sendMail()
    done()
  })

  it('should send an email', function (done) {
    var newReport = CrashReport({
      product: 'foo',
      version: 'bar'
    })

    newReport.save(function (error) {
      assert.equal(error, null)
      assert.equal(StubTransporter.queue.length, 1)
      done()
    })
  })
})
