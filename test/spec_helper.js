var mockgoose = require('mockgoose')
var mongoose = require('mongoose')


beforeEach(function(done) {
  mockgoose(mongoose).then(function() {
    mongoose.connect('mongodb://localhost/test-db');
  })
});
