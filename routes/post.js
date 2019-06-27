const express = require('express');
const router = express.Router();

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/* GET post listening. */
router.get('/sendmail', function (req, res, next) {
  console.log('1')
  var msg = {
    to: 'kimms@gananetworks.com',
    from: 'kimms@gananetworks.com',
    subject: 'Sending with Twilio SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  };
  sgMail
    .send(msg)
    .then(msg => console.log('success : ', msg))
    .catch(err => console.log('fail : ', err));

});

module.exports = router;
