/* eslint-env mocha */
require('../spec_helper')
var assert = require('chai').assert
var BugReport = require('../../models/bug_report')

describe('Bug report', function () {
  it('should send an email', function (done) {
    var newReport = BugReport({
      product: 'foo',
      version: 'bar'
    })
    assert.equal(global.StubSmtpTransporter.queue.length, 0)

    newReport.save(function (error) {
      // We'll have to wait for post hook to trigger
      setTimeout(function () {
        assert.equal(error, null)
        assert.equal(global.StubSmtpTransporter.queue.length, 1)
        assert.include(global.StubSmtpTransporter.queue[0].data.markdown, 'Report: Bug')
        done()
      }, 10)
    })
  })
})
