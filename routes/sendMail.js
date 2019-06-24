const fs = require('fs');
const express = require('express');
const router = express.Router();
require('dotenv').config();

const api_key = process.env.SENDGRID_API_KEY;
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(api_key);
const resultFile = fs.createWriteStream('emailResult.txt');
//TODO: template error!!
//https://stackoverflow.com/questions/48469666/error-enoent-no-such-file-or-directory-open-moviedata-json?rq=1
// const email_template = fs.readFileSync('email-template-main.html').toString();

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

router.get('/test', async (req, res, next) => { 
  // res.send("router check *****")
  res.send(process.env.ACCESS_KEY_ID);
})

module.exports = router;
