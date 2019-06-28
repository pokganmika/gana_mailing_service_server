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

// template module
const infoMailOrigin = '<a href="mailto:info@ganacoin.io" style="color: white;">info@ganacoin.io</a>';
const addition = '&nbsp;|&nbsp;';

const tagFilter = text => {
  return text.split('\n').map(e => `<p>${e}</p>`).join('');
}

const setSeg = arr => {
  if (arr.length !== 0) { 
    const tempArr = arr.map(e => `<a href=${e.url} target="_blank" style="color: white; text-decoration: underline;">${e.title}</a>`)
    if (tempArr.length === 1) { 
      return tempArr[0];
    }
    return tempArr.join(addition);
    // return tempArr.join('&nbsp;|&nbsp;');
  }
}

const setLink = arr => { 
  if (arr.length !== 0) { 
    const tempArr = arr.map(e => `<a href=${e.url} target="_blank" style="color: white; text-decoration: underline;">${e.title}</a>`)
    if (tempArr.length === 1) { 
      return tempArr[0];
    }
    return tempArr.join('<br>');
  }
}

const editTemplate = data => { 
  const { 
    mainTitle,
    detailTitleEng,
    detailTitleKor,
    infoMail,
    linkEng,
    linkKor,
  } = data;
  let {
    textEng,
    textEngOp,
    textKor,
    textKorOp,
  } = data;

  textEng = tagFilter(textEng);
  textEngOp = tagFilter(textEngOp);
  textKor = tagFilter(textKor);
  textKorOp = tagFilter(textKorOp);

  const segE = setSeg(linkEng.segment);
  const segK = setSeg(linkKor.segment);
  const linkE = setLink(linkEng.link);
  const linkK = setLink(linkKor.link);

  let html = email_template;
  html = html.replace("[Unsubscribe]", "<%asm_group_unsubscribe_raw_url%>");
  html = html.replace("[Unsubscribe]", "<%asm_group_unsubscribe_raw_url%>");
  html = html.replace("<!-- {{ mainTitle }} -->", mainTitle);
  html = html.replace("<!-- {{ detailTitleEng }} -->", detailTitleEng);
  html = html.replace("<!-- {{ textEng }} -->", textEng);
  html = html.replace("<!-- {{ textEngOp }} -->", textEngOp);
  html = html.replace("<!-- {{ detailTitleKor }} -->", detailTitleKor);
  html = html.replace("<!-- {{ textKor }} -->", textKor);
  html = html.replace("<!-- {{ textKorOp }} -->", textKorOp);

  html = html.replace("<!-- {{ segE }} -->", segE);
  html = html.replace("<!-- {{ segK }} -->", segK);
  html = html.replace("<!-- {{ linkE }} -->", linkE);
  html = html.replace("<!-- {{ linkK }} -->", linkK);

  if (infoMail) {
    html = html.replace("<!-- {{ infoMailE }} -->", infoMailOrigin);
    html = html.replace("<!-- {{ infoMailK }} -->", infoMailOrigin);
  }

  return html;
}

router.post('/', async (req, res, next) => {
  const params = { TableName };
  const html = editTemplate(req.body);

  await docClient.scan(params, async (err, data) => { 
    if (err) {
      console.log("SubscribeTable::sendmail::describeTable::error - " + JSON.stringify(err, null, 2))
    } else { 
      console.log("SubscribeTable::sendmail::describeTable::success - " + JSON.stringify(data, null, 2))
      const { Items, Count, ScannedCount } = data;
      // console.log('check this :: ', Items);

      const email = [];
      Items.forEach(emails =>
        emails.subscribed && email.push({ email: emails.email })
      );
      console.log('forEach::check:: ', email);

      const { emailTitle } = req.body;
    
      email.forEach(async email => { 
        console.log('forEach::check:: ', email);
        const msg = {
          to: email,
          from: 'GanaProject <no-reply@ganacoin.io>',
          subject: emailTitle,
          text: emailTitle,
          html
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
  const {
    email,
    emailTitle,
    mainTitle,
    detailTitleEng,
    detailTitleKor,
    infoMail,
    linkEng,
    linkKor,
  } = req.body;

  let {
    textEng,
    textEngOp,
    textKor,
    textKorOp,
  } = req.body;
  console.log('::first::check:: ---> ', email, emailTitle);
  console.log('::second::check::link:: ---> ', linkEng)
  const html = editTemplate(req.body);

  console.log('html::sendmail::typecheck:: --->', typeof html);
  // console.log('html::sendmail::typecheck:: --->', html);
  const msg = {
    to: email,
    from: 'GanaProject <no-reply@ganacoin.io>',
    subject: emailTitle,
    text: emailTitle,
    html
  };

  await sgMail
    .send(msg)
    .then(data => { 
      res.send("testmail sending success")
      console.log("testmail::send::success::")
    })
    .catch(err => {
      res.send("testmail sendding fail")
      console.log("testmail::send::error::", err)
    })
})

module.exports = router;
