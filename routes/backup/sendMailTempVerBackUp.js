const fs = require('fs');
const express = require('express');
const router = express.Router();
require('dotenv').config();

const api_key = process.env.SENDGRID_API_KEY;
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(api_key)
const resultFile = fs.createWriteStream('emailResult.txt');
const email_template = require('../../readfile');
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
          .then(data => { 
            res.send("mail sending success")
            console.log("mail::send::success::")
          })
          .catch(err => {
            res.send("mail sendding fail")
            console.log("mail::send::error::", err)
          })

      })

    }
  })

})

router.post('/test', async (req, res, next) => { 
  console.log('sendmail::test::data::check:: ----- > : ', req.body);
  let {
    email,
    emailTitle,
    mainTitle,
    detailTitleEng,
    textEng,
    textEngOp,
    detailTitleKor,
    textKor,
    textKorOp,
    link: { 
      linkETitle, linkKTitle, linkEUrl, linkKUrl,
      fSegETitle, fSegKTitle, fSegEUrl, fSegKUrl,
      sSegETitle, sSegKTitle, sSegEUrl, sSegKUrl
    }
  } = req.body;
  console.log('::first::check:: ---> ', email, emailTitle);
  console.log('::second::check:: ---> ', linkETitle, linkKTitle);
  textEng = textEng.split('\n').map(e => <p>e</p>);
  console.log('::third::check:: ---> ', textEng);
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
          textEngOp,
          detailTitleKor,
          textKor,
          textKorOp,
          linkETitle, linkKTitle, linkEUrl, linkKUrl,
          fSegETitle, fSegKTitle, fSegEUrl, fSegKUrl,
          sSegETitle, sSegKTitle, sSegEUrl, sSegKUrl, 
          // est1, esu1, est2, esu2,
          // elt, elu,
          // kst1, ksu1, kst2, ksu2,
          // klt, klu
        },
      }
    ],
    template_id: "d-ab71c11eb2ab4c04aaaaf865b33d82ed"
  };
  // await sgMail
  //   .send(msg)
  //   .then(data => { 
  //     res.send("testmail sending success")
  //     console.log("testmail::send::success::")
  //   })
  //   .catch(err => {
  //     res.send("testmail sendding fail")
  //     console.log("testmail::send::error::", err)
  //   })
})

module.exports = router;
