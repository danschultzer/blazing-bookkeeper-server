module.exports = function (type) {
  var nodemailer = require('nodemailer')
  var markdown = require('nodemailer-markdown').markdown
  var Admin = require('../models/admin')
  var BugReport = require('../models/bug_report')
  var CrashReport = require('../models/crash_report')
  var emails

  return new Promise(function (resolve, reject) {
    Admin.find(function (error, admins) {
      if (error) {
        return reject(error)
      }

      emails = admins.map(function (admin) {
        return admin.email
      })
      var classObject = type === 'Bug' ? BugReport : CrashReport
      var limit = {}

      classObject.find(limit, function (error, reports) {
        if (error) {
          return reject(error)
        }

        resolve(reports)
      })
    })
  }).then(function (reports) {
    var message = ''
    reports.forEach(function (report) {
      var url = `https://blazingbookkeeper.com/api/v1/${type === 'Bug' ? 'bug' : 'crash'}-report/${report._id}`

      message += `### Report: ${type} \n` +
                 `- Date: ${report.created_at} \n` +
                 `- File: ${report.file} \n` +
                 `- Link: [${report._id}](${url})\n\n` +
                 '--- \n'
    })
    var opts = {
      from: 'no-reply@blazingbookkeeper.com',
      to: emails.join(', '),
      subject: type,
      markdown: message
    }

    var transporter = nodemailer.createTransport(global.config.smtpTransporter)

    transporter.use('compile', markdown())
    transporter.sendMail(opts, function (error, info) {
      if (error) {
        return console.error(error)
      }
      console.log('Message sent: ' + info.response)
    })

    return transporter
  })
}
