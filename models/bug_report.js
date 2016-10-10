var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var bugReportSchema = new Schema({
    product   : { type: String, required: true },
    version   : { type: String, required: true },
    sender    : Object,
    report    : Object,
    comments  : String,
    email     : String,
    file      : String,
    created_at: Date,
    updated_at: Date
});

bugReportSchema.index({ sender: 1, email: 1, comments: 1, report: 1 }, { unique: true });

bugReportSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

var BugReport = mongoose.model('BugReport', bugReportSchema);

module.exports = BugReport;
