/* eslint-env mocha */
var mockgoose = require('mockgoose')
var mongoose = require('mongoose')

before(function (done) {
  mockgoose(mongoose).then(function () {
    mongoose.connect('mongodb://localhost/test-db')
  })
  done()
})
