// https://github.com/andris9/nodemailer-stub-transport
module.exports = new StubTransport()

function StubTransport () {
  this.queue = []
}

StubTransport.prototype.send = function (mail) {
  this.queue.push(mail)
}

StubTransport.prototype.reset = function () {
  this.queue = []
}
