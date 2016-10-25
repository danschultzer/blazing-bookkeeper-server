var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var crashReportSchema = new Schema({
    product   : { type: String, required: true },
    version   : { type: String, required: true },
    sender    : Object,
    fields    : Object,
    file      : String,
    created_at: Date,
    updated_at: Date
});

crashReportSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

crashReportSchema.post('save', function(report) {
  console.log(crashReportSchema);
  var notify = require('../helpers/notification');
  notify('Crash Report', 'Crash', crashReportSchema.index.created_at, crashReportSchema.index.file, crashReportSchema.index._id);
});


var CrashReport = mongoose.model('CrashReport', crashReportSchema);

module.exports = CrashReport;
