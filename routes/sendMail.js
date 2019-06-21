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
  region: "ap-northeast-2",
  accessKeyId: "AKIAJE7AXS4OATS2VSZA",
  secretAccessKey: "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"
}
AWS.config.update(awsConfig);

const TableName = "SubscribeTable";
let docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

router.get('/', async (req, res, next) => { 
  res.send("router check +++++")
})

module.exports = router;
