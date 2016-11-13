// https://github.com/andris9/nodemailer-stub-transport
module.exports = function () {
    return new StubTransport();
};

function StubTransport() {
    this.queue = [];
}

StubTransport.prototype.send = function (mail) {
    this.queue.push(mail)
};
