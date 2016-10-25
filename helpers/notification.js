module.exports = function(subject, type, date, file, path, id) {
  var nodemailer = require('nodemailer');
  var smtpTransport = require('nodemailer-smtp-transport');
  var markdown = require('nodemailer-markdown').markdown;

  var transporter = nodemailer.createTransport(smtpTransport({
      service: 'gmail',
      auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASS
      }
  }));

  var opts = {
      from: process.env.NODEMAILER_SENDER,
      to: process.env.NODEMAILER_RECEIVER,
      subject: subject,
      markdown: '## Report: ' + type + '\n' + '---' + '\n' +
                '- Date: ' + date + '\n' +
                '- File: ' + '`' + file + '`' + '\n' + '---' + '\n' +
                '### Report ' + '[' + id + '](https://blazingbookkeeper.com' + path + id + ')'
  };

  transporter.use('compile', markdown());
  transporter.sendMail(opts, function(error, info){
      if(error){
          return console.log(error);
      }
      console.log('Message sent: ' + info.response);
  });

  return transporter;
};
