/* eslint-env mocha */
require('../spec_helper')
var assert = require('chai').assert
var BugReport = require('../../models/bug_report.js')
var StubTransporter = require('../stub_transporter')

describe('Bug report', function (done) {
  it('should send an email', function () {
    var newReport = BugReport({
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
