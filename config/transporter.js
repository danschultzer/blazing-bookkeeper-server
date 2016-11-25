var smtpTransport = require('nodemailer-smtp-transport')

module.exports = exports = smtpTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})
