var fs = require('fs');

var email_template = fs.readFileSync('./template/email-sample.html', 'utf8').toString();
// console.log(email_template);

module.exports = email_template;
