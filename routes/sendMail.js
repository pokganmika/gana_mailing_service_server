const fs = require('fs');
const express = require('express');
const Log = require('../models').Log;
const router = express.Router();
const moment = require('moment');
require('dotenv').config();

const api_key = process.env.SENDGRID_API_KEY;
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(api_key)
const resultFile = fs.createWriteStream('emailResult.txt');
const email_template = require('../readfile');

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
  console.log('::template::link::check:: ---> : ', typeof segE)

  // TODO: <a href="%your_replacement_tag_value%">Unsubscribe Here</a>
  // check!
  let html = email_template;
  html = html.replace("[Unsubscribe]", "<%asm_group_unsubscribe_raw_url%>");
  html = html.replace("<!-- {{ mainTitle }} -->", mainTitle);
  html = html.replace("<!-- {{ detailTitleEng }} -->", detailTitleEng);
  html = html.replace("<!-- {{ textEng }} -->", textEng);
  html = html.replace("<!-- {{ textEngOp }} -->", textEngOp);
  html = html.replace("<!-- {{ detailTitleKor }} -->", detailTitleKor);
  html = html.replace("<!-- {{ textKor }} -->", textKor);
  html = html.replace("<!-- {{ textKorOp }} -->", textKorOp);

  if (segE) { 
    html = html.replace("<!-- {{ segE }} -->", segE);
  }
  if (segK) { 
    html = html.replace("<!-- {{ segK }} -->", segK);
  }
  if (linkE) { 
    html = html.replace("<!-- {{ linkE }} -->", linkE);
  }
  if (linkK) { 
    html = html.replace("<!-- {{ linkK }} -->", linkK);
  }

  if (infoMail) {
    html = html.replace("<!-- {{ infoMailE }} -->", infoMailOrigin);
    html = html.replace("<!-- {{ infoMailK }} -->", infoMailOrigin);
  }

  return html;
}

router.post('/', async (req, res, next) => {
  const params = { TableName };
  const html = editTemplate(req.body);

  // const email = [];
  // const { emailTitle } = req.body;
  const emailArr = [];
  const { emailTitle } = req.body;

  await docClient.scan(params, async (err, data) => { 
    if (err) {
      console.log("SubscribeTable::sendmail::describeTable::error - " + JSON.stringify(err, null, 2))
    } else { 
      console.log("SubscribeTable::sendmail::describeTable::success - " + JSON.stringify(data, null, 2))
      const { Items, Count, ScannedCount } = data;
      // console.log('check this :: ', Items);

      // const email = [];
      // await Items.forEach(emails =>
      //   emails.subscribed && email.push({ email: emails.email })
      // );
      // console.log('forEach::check:: ', email);

      // const { emailTitle } = req.body;
    
      //-----

      // const emailArr = [];
      // const { emailTitle } = req.body;
      await Items.forEach(emails =>
        emails.subscribed && emailArr.push({ email: emails.email })
      );
      console.log('forEach::check:: ', emailArr);


      const msg = {
        to: emailArr,
        from: 'GanaProject <no-reply@ganacoin.io>',
        subject: emailTitle,
        text: emailTitle,
        html,
      };
      await sgMail
        .sendMultiple(msg)
        .then(data => { 
          console.log("mail::send::success::")
          res.send("mail sending success")

          Log.create({
            operName: 'Send Mail (ALL)',
            status: true,
            eventInitBy: 'admin',
            target: 'send all',
            time: moment().format('MMMM Do YYYY, h:mm:ss a')
          })
        })
        .catch(err => {
          console.log("mail::send::error::", err)
          res.send("mail sendding fail")

          Log.create({
            operName: 'Send Mail (ALL)',
            status: false,
            eventInitBy: 'admin',
            target: 'send all',
            time: moment().format('MMMM Do YYYY, h:mm:ss a')
          })
        })


      //-----

      // email.forEach(async email => { 
      //   console.log('forEach::check:: ', email);
      //   const msg = {
      //     to: email,
      //     from: 'GanaProject <no-reply@ganacoin.io>',
      //     subject: emailTitle,
      //     text: emailTitle,
      //     html,
      //     // asm: {
      //     //   group_id: 6179
      //     // }
      //   };
      //   await sgMail
      //     .send(msg)
      //     .then(data => { 
      //       res.send("mail sending success")
      //       console.log("mail::send::success::")
      //     })
      //     .catch(err => {
      //       res.send("mail sendding fail")
      //       console.log("mail::send::error::", err)
      //     })
      // })
    }
    // email.forEach(async email => { 
    //   console.log('forEach::check:: ', email);
    //   const msg = {
    //     to: email,
    //     from: 'GanaProject <no-reply@ganacoin.io>',
    //     subject: emailTitle,
    //     text: emailTitle,
    //     html,
    //     // asm: {
    //     //   group_id: 6179
    //     // }
    //   };
    //   await sgMail
    //     .send(msg)
    //     .then(data => { 
    //       res.send("mail sending success")
    //       console.log("mail::send::success::")
    //     })
    //     .catch(err => {
    //       res.send("mail sendding fail")
    //       console.log("mail::send::error::", err)
    //     })
    // })
  })
})

router.post('/test', async (req, res, next) => { 
  console.log('sendmail::test::data::check:: ----- > : ', req.body);
  const {
    email,
    emailTitle,
  } = req.body;

  // console.log('::first::check:: ---> ', req.body);
  const html = editTemplate(req.body);

  // console.log('html::sendmail::typecheck:: --->', typeof html);
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
      console.log("testmail::send::success::")
      res.send("testmail sending success")

      Log.create({
        operName: 'Test Mail Send',
        status: true,
        eventInitBy: 'admin',
        target: email,
        time: moment().format('MMMM Do YYYY, h:mm:ss a')
      })
    })
    .catch(err => {
      console.log("testmail::send::error::", err)
      res.send("testmail sendding fail")

      Log.create({
        operName: 'Test Mail Send',
        status: false,
        eventInitBy: 'admin',
        target: email,
        time: moment().format('MMMM Do YYYY, h:mm:ss a')
      })
    })
})

router.post('/sendlater', async (req, res, next) => {
  console.log('::sendmail::later::data::check:: ---> ', req.body);
  const { time } = req.body;

  const strHour = time.hour.length === 1 ? '0' + time.hour : time.hour;
  const strMinute = time.minute.length === 1 ? '0' + time.minute : time.minute;
  const strSecond = time.second.length === 1 ? '0' + time.second : time.second;

  const year = Number(time.year);
  const day = Number(time.day);
  const hour = Number(time.hour);
  const minute = time.minute ? Number(time.minute) : 0;
  const second = time.second ? Number(time.second) : 0;

  let month;
  switch (time.month) { 
    case 'Jan': { 
      month = 00;
      break;
    }
    case 'Feb': { 
      month = 01;
      break;
    }
    case 'Mar': { 
      month = 02;
      break;
    }
    case 'Apr': { 
      month = 03;
      break;
    }
    case 'May': { 
      month = 04;
      break;
    }
    case 'Jun': { 
      month = 05;
      break;
    }
    case 'Jul': { 
      month = 06;
      break;
    }
    case 'Aug': { 
      month = 07;
      break;
    }
    case 'Sep': { 
      month = 08;
      break;
    }
    case 'Oct': { 
      month = 09;
      break;
    }
    case 'Nov': { 
      month = 10;
      break;
    }
    case 'Dec': { 
      month = 11;
      break;
    }
    default: {
      month = 'unhandled month';
    }
  }

  const strTime = `${time.month} ${time.day} ${time.year}, ${strHour}:${strMinute}:${strSecond}`;
  const unixTime = Math.floor(new Date(year, month, day, hour, minute, second).getTime()/1000);

  console.log('::unixTime::check:: ---> : ', unixTime);
  console.log('::strTime::check:: ---> : ', strTime);

  const params = { TableName };
  const html = editTemplate(req.body);

  const emailArr = [];
  const { emailTitle } = req.body;

  await docClient.scan(params, async (err, data) => { 
    if (err) {
      console.log("SubscribeTable::sendmail::describeTable::error - " + JSON.stringify(err, null, 2))
    } else { 
      console.log("SubscribeTable::sendmail::describeTable::success - " + JSON.stringify(data, null, 2))
      const { Items, Count, ScannedCount } = data;

      await Items.forEach(emails =>
        emails.subscribed && emailArr.push({ email: emails.email })
      );
      console.log('forEach::check:: ', emailArr);

      const msg = {
        to: emailArr,
        from: 'GanaProject <no-reply@ganacoin.io>',
        send_at: unixTime,
        subject: emailTitle,
        text: emailTitle,
        html,
      };
      await sgMail
        .sendMultiple(msg)
        .then(data => { 
          console.log("mail::send::success::")
          res.send("mail sending success")

          Log.create({
            operName: 'Send Later',
            status: true,
            eventInitBy: 'admin',
            target: 'send all',
            time: moment().format('MMMM Do YYYY, h:mm:ss a')
          })
        })
        .catch(err => {
          console.log("mail::send::error::", err)
          res.send("mail sendding fail")

          Log.create({
            operName: 'Send Later',
            status: false,
            eventInitBy: 'admin',
            target: 'send all',
            time: moment().format('MMMM Do YYYY, h:mm:ss a')
          })
        })
    }
  })
})

module.exports = router;
