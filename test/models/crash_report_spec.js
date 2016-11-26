/* eslint-env mocha */
require('../spec_helper')
var assert = require('chai').assert
var CrashReport = require('../../models/crash_report.js')
var StubTransporter = require('../stub_transporter')

describe('Crash report', function (done) {
  it('should send an email', function () {
    var newReport = CrashReport({
      product: 'foo',
      version: 'bar'
    })
    assert.equal(StubTransporter.queue.length, 0)

    newReport.save(function (error) {
      assert.equal(error, null)
      assert.equal(StubTransporter.queue.length, 1)
      done()
    })
  })
})
