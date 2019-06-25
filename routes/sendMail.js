const fs = require('fs');
const express = require('express');
const router = express.Router();
require('dotenv').config();

const api_key = process.env.SENDGRID_API_KEY;
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(api_key)
var resultFile = fs.createWriteStream('emailResult.txt');
var email_template = require('../readfile');
// var email_template = fs.readFileSync('../template/email-template.html').toString();
//TODO: template error!!
//https://stackoverflow.com/questions/48469666/error-enoent-no-such-file-or-directory-open-moviedata-json?rq=1
// const email_template = fs.readFileSync('email-template-main.html').toString();

const mail_header = {
  to: '',
  from: 'GanaProject <no-reply@ganacoin.io>',//수정할부분
  subject: '"835M" GANA Token Burn (GANA의 토큰 소각이 진행됩니다.)',//수정할부분
  text: '"835M" GANA Token Burn (GANA의 토큰 소각이 진행됩니다.)',//수정할부분
  html: email_template.replace("[Unsubscribe]", "<%asm_group_unsubscribe_raw_url%>"),
  asm: {
      group_id: 6179
  }
};

const AWS = require('aws-sdk');
let awsConfig = {
  region: process.env.REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
}
AWS.config.update(awsConfig);

const TableName = "SubscribeTable";
let docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

router.get('/', async (req, res, next) => { 
  res.send("router check +++++")
})

router.post('/test', async (req, res, next) => { 
  const {
    email,
    emailTitle,
    mainTitle,
    detailTitleEng,
    textEng,
    detailTitleKor,
    textKor } = req.body;
  // console.log('sendmail::test::req.body -> ', req.body);
  // console.log('sendmail::test::req.body.email -> ', req.body.email);
  console.log('sendmail::test:: check -> ', email, emailTitle);
  const msg = {
    from: 'GanaProject <no-reply@ganacoin.io>',
    personalizations: [
      {
        to: [
          {
            email
          }
        ],
        dynamic_template_data: {
          subject: emailTitle,
          mainTitle,
          detailTitleEng,
          textEng,
          detailTitleKor,
          textKor
        },
      }
    ],
    template_id: "d-ab71c11eb2ab4c04aaaaf865b33d82ed"
    // to: email,
    // from: 'GanaProject <no-reply@ganacoin.io>',
    // templateId: 'id_11561368817931',
    // dynamic_template_date: {
    //   subject: emailTitle,
    //   mainTitle,
    //   detailTitleEng,
    //   textEng,
    //   detailTitleKor,
    //   textKor
    // }
  };
  await sgMail
    .send(msg)
    // .then(res => console.log('res::check::', res))
    // .catch(err => console.log('err::check::', err))

  //-----

  // const params = {
  //   TableName: 'SubscribeTable',
  //   Key: {
  //     email: req.body.email
  //   }
  // }
  // await docClient.get(params, (err, data) => { 
  //   if (err) {
  //     console.log("mail::get::error - ", err);
  //     res.send(err)
  //   } else { 
  //     console.log("mail::get::data - ", data);
  //     res.send('get_success')
  //     const msg = {
  //       to: data.Item.email,
  //       from: 'GanaProject <no-reply@ganacoin.io>',//수정할부분
  //       subject: '"835M" GANA Token Burn (GANA의 토큰 소각이 진행됩니다.)',//수정할부분
  //       text: '"835M" GANA Token Burn (GANA의 토큰 소각이 진행됩니다.)',//수정할부분
  //       html: email_template.replace("[Unsubscribe]", "<%asm_group_unsubscribe_raw_url%>"),
  //     };
  //     // -----
  //     // const msg = {
  //     //   to: data.Item.email,
  //     //   from: 'kimms@gananetworks.com',
  //     //   subject: 'Sending with Twilio SendGrid is Fun',
  //     //   text: 'and easy to do anywhere, even with Node.js',
  //     //   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  //     // };
  //     sgMail.send(msg);
  //   }
  // })

})

module.exports = router;
