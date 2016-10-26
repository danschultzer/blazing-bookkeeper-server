module.exports = function(type) {
  var nodemailer = require('nodemailer'),
  smtpTransport = require('nodemailer-smtp-transport'),
  markdown = require('nodemailer-markdown').markdown,
  Admin = require('../models/admin'),
  BugReport = require('../models/bug_report'),
  CrashReport = require('../models/crash_report');

  return new Promise((function(resolve, reject) {
    Admin.find(function(error, admins) {
      if(error)
        return reject(error);

      var emails = admins.map(function(admin) {
        return admin.email;
      });
      var classObject = 'type' == 'Bug' ? BugReport : CrashReport;
      var limit = {};

      classObject.find(limit, function(error, reports) {
        if(error)
          return reject(error);

        resolve(reports);
      });
    });
  })).then(function(reports) {

    var message = '';
    reports.forEach(function(report) {
      var url = `https://blazingbookkeeper.com/api/v1/${type == 'Bug' ? 'bug' : 'crash'}-report/${this._id}`;

      message += `### Report: ${type} \n` +
                 `- Date: ${report.created_at} \n` +
                 `- File: ${report.file} \n` +
                 `- Link: [${report._id}](${url})\n\n` +
                 '--- \n';
    });
    var opts = {
        from: 'no-reply@blazingbookkeeper.com',
        to: emails.join(', '),
        subject: type,
        markdown: message
    };

    var transporter = nodemailer.createTransport(smtpTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    }));

    transporter.use('compile', markdown());
    transporter.sendMail(opts, function(error, info){
        if(error){
            return console.error(error);
        }
        console.log('Message sent: ' + info.response);
    });

    return transporter;
  });
};
