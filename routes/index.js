var express = require('express');
var router = express.Router();

var sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/* GET home page. */
router.get('/', async function(req, res, next) {
  // res.render('index', { title: 'Express' });
  // var msg = {
  //   to: 'kimms@gananetworks.com',
  //   from: 'kimms@gananetworks.com',
  //   subject: 'Sending with Twilio SendGrid is Fun',
  //   text: 'and easy to do anywhere, even with Node.js',
  //   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  // };
  // sgMail
  //   .send(msg)
  //   .then(function (msg) { console.log('success : ', msg) })
  //   .catch(function (err) { console.log('fail : ', err) });
  
});

module.exports = router;
