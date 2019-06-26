const fs = require('fs');
const express = require('express');
const router = express.Router();
require('dotenv').config();

const api_key = process.env.SENDGRID_API_KEY;
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(api_key)
const resultFile = fs.createWriteStream('emailResult.txt');
const email_template = require('../readfile');
// const email_template = fs.readFileSync('../template/email-template.html').toString();
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
const awsConfig = {
  region: process.env.REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
}
AWS.config.update(awsConfig);

const TableName = "SubscribeTable";
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

// const sendMail = async (dbData, reqData) => { 
//   const { 
//     Items,
//     Count,
//     ScannedCount
//   } = dbData;
//   const { 
//     emailTitle,
//     mainTitle,
//     detailTitleEng,
//     textEng,
//     detailTitleKor,
//     textKor
//   } = reqData;
// }

router.post('/', async (req, res, next) => {
  const params = {
    // TableName: 'SubscribeTable'
    TableName
  };

  await docClient.scan(params, async (err, data) => { 
    if (err) {
      console.log("SubscribeTable::sendmail::describeTable::error - " + JSON.stringify(err, null, 2))
    } else { 
      console.log("SubscribeTable::sendmail::describeTable::success - " + JSON.stringify(data, null, 2))
      const { Items, Count, ScannedCount } = data;
      // console.log('check this :: ', Items);

      const email = [];
      Items.forEach(emails => email.push({ email: emails.email }));
      console.log('forEach::check:: ', email);

      const {
        emailTitle,
        mainTitle,
        detailTitleEng,
        textEng,
        detailTitleKor,
        textKor
      } = req.body;
    
      email.forEach(async email => { 
        console.log('forEach::check:: ', email);
        const msg = {
          from: 'GanaProject <no-reply@ganacoin.io>',
          personalizations: [
            {
              to: email,
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
        };
        await sgMail
          .send(msg)
          .then(res => { 
            // res.send("mail sending success")
            console.log("mail::send::success::")
          })
          .catch(err => {
            // res.send("mail sendding fail")
            console.log("mail::send::error::", err)
          })

      })

    }
  })

})

router.post('/test', async (req, res, next) => { 
  console.log('sendmail::test::data::check:: ----- > : ', req.body);
  const {
    email,
    emailTitle,
    mainTitle,
    detailTitleEng,
    textEng,
    detailTitleKor,
    textKor } = req.body;
  console.log('sendmail::test:: check -> ', email, emailTitle);
  const msg = {
    from: 'GanaProject <no-reply@ganacoin.io>',
    personalizations: [
      {
        to: [{ email }],
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
    .then(res => { 
      res.send("testmail sending success")
      console.log("testmail::send::success::")
    })
    .catch(err => {
      res.send("testmail sendding fail")
      console.log("testmail::send::error::", err)
    })
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
