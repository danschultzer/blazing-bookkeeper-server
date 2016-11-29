/* eslint-env mocha */
var app = require('../spec_controller_helper')
var assert = require('chai').assert
var CrashReport = require('../../models/crash_report')
var request = require('supertest')

describe('GET crash-report', function () {
  it('should respond', function (done) {
    var newReport = CrashReport({
      product: 'foo',
      version: 'bar'
    })
    newReport.save(function (error) {
      assert.equal(error, null)

      request(global.server)
        .get('/api/v1/crash-report/' + newReport._id)
        .expect('Content-Type', /json/)
        .set('authorization', 'Bearer ' + global.adminUser.access_token)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err
          assert.equal(res.body._id, newReport._id)
          done()
        })
    })
  })
})
