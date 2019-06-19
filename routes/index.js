var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });

  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // const msg = {
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
